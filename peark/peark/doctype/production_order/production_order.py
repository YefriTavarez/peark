# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
import pyqrcode

from frappe.model.document import Document

from frappe import db as database
from frappe import _ as translate
from frappe import _dict as pydict

from frappe.utils import cint


class ProductionOrder(Document):
    def before_print(self):
        self.set_qr_image()
        self.set_paperboard()
        self.set_allow_printing()
        self.set_printing_sides()
        self.set_front_pantones_str()
        self.set_back_pantones_str()
        self.set_repeated_work_in_words()

    def before_insert(self):
        self.validate_duplicates_production_orders()

    def on_change(self):
        self.update_indexes()

    def on_update(self):
        self.update_project_center_dates()
        self.update_project_center_status(ontrash=False)

    def on_trash(self):
        self.update_project_center_status(ontrash=True)

    def validate(self):
        self.validate_item_agaist_product_assembly()
        self.fetch_item_specs()

    def fetch_item_specs(self):
        doctype = "Product Assembly"
        name = self.product_assembly
        fieldname = "full_specifications"

        if not name:
            return False

        value = frappe.get_value(doctype, name, fieldname)

        self.item_specs = value

    def validate_duplicates_production_orders(self):
        if not self.project_center:
            return "production order without project center"

        doctype = self.doctype
        filters = {
            "name": ["!=", self.name],
            "project_center": self.project_center
        }

        value = database.get_value(doctype, filters)

        if not value:
            return "ok"

        err_msg = translate("A Production Order exists "
                            "against this Project Center.")

        frappe.throw(err_msg.format(value))

    def validate_item_agaist_product_assembly(self):
        fields = ("ref_doctype", "ref_docname")

        doctype = "Item"
        name = self.item

        ref_doctype, ref_docname = database \
            .get_value(doctype, name, fields)

        field = self.meta.get_field("product_assembly")

        errmsg = translate("Item: {} is not a type of Product Assembly: {}")
        if field.options != ref_doctype \
                or self.product_assembly != ref_docname:
            frappe.throw(errmsg.format(name, self.product_assembly))

    def get_project_center(self):
        doctype = "Project Center"
        name = self.project_center

        return frappe.get_doc(doctype, name)

    def update_project_center_dates(self):
        doc = self.get_project_center()

        doc.actual_start_date = self.expected_start_date
        doc.actual_end_date = self.expected_end_date

        doc.save(ignore_permissions=True)

    def update_project_center_status(self, ontrash=True):
        doc = self.get_project_center()

        # status_map = {
        #     "Open": "In Progress",
        #     "Started": "In Progress",
        #     "Delayed": "Delayed",
        #     "Stopped": "Stopped",
        #     "Cancelled": "Cancelled",
        #     "Completed": "Completed",
        # }

        status = self.status

        if ontrash:
            status = "Unknown"

        if status == doc.status:
            return "status not changed"

        doc.production_status = status

        doc.save(ignore_permissions=True)

    def set_qr_image(self):
        qrobj = pyqrcode.create(self.name)
        qr_image = qrobj.png_as_base64_str(6)

        # set class property
        self.qr_image = "data:image/png;base64, {0}".format(qr_image)

    def set_paperboard(self):
        doctype = "Product Assembly"
        name = self.product_assembly
        fieldname = "paperboard"

        self.paperboard = database.get_value(doctype, name, fieldname)

    def set_allow_printing(self):
        doctype = "Product Profile"
        name = self.product_profile
        fieldname = "allow_printing"

        self.allow_printing = database.get_value(doctype, name, fieldname)

    def set_front_pantones_str(self):
        self.front_pantones_str = ", " \
            .join([d.pantone_code for d in self.front_pantones])

    def set_back_pantones_str(self):
        self.back_pantones_str = ", " \
            .join([d.pantone_code for d in self.back_pantones])

    def set_printing_sides(self):
        doctype = "Product Assembly"
        name = self.product_assembly
        fields = ("front_colors", "pantone_colors",
                  "back_colors", "pantone_back_colors")

        front_colors, pantone_colors, back_colors, pantone_back_colors \
            = database.get_value(doctype, name, fields)

        self.printing_sides = "Sin Impresión"

        if cint(front_colors) > 0 \
                or cint(pantone_colors) > 0:
            self.printing_sides = translate("One Side")

            if cint(back_colors) > 0 \
                    or cint(pantone_back_colors) > 0:
                self.printing_sides = translate("Two Sides")

    def set_repeated_work_in_words(self):
        self.repeated_work_in_words = translate("Yes") \
            if self.get("repeated_work") else translate("No")

    def set_item(self):
        doctype = "Project Center"
        name = self.project_center
        fields = [
            "item_code",
            "item_specifications",
        ]

        if name:
            self.item, self.item_specs = database \
                .get_value(doctype, name, fields)

    def set_product_name(self):
        doctype = "Project Center"
        name = self.project_center
        fieldname = "product_name"

        if name:
            self.product_name = database \
                .get_value(doctype, name, fieldname)

    def set_qty(self):
        doctype = "Project Center"
        name = self.project_center
        fieldname = "production_qty"

        if name:
            self.qty = database \
                .get_value(doctype, name, fieldname)

    def set_customer(self):
        doctype = "Project Center"
        name = self.project_center
        fieldname = "customer"

        if name:
            self.customer = database \
                .get_value(doctype, name, fieldname)

    def set_sales_order(self):
        doctype = "Project Center"
        name = self.project_center
        fieldname = "sales_order"

        if name:
            self.sales_order = database \
                .get_value(doctype, name, fieldname)

    def set_repeated_work(self):
        doctype = "Project Center"
        name = self.project_center
        fieldname = "repeated_work"

        if name:
            self.repeated_work = database \
                .get_value(doctype, name, fieldname)

    def set_product_profile(self):
        doc = self.get_product_assembly()

        self.product_profile = doc.product_profile

    def set_product_assembly(self):
        doc = self.get_product_assembly()

        self.product_assembly = doc.name

    def set_colors(self, assembly=None):
        # BASIC COLORS
        doctype = "Project Center"
        name = self.project_center
        fieldname = ("front_colors", "back_colors")

        if not name:
            return False

        doc = frappe.get_doc(doctype, name)

        self.front_colors = doc.front_colors
        self.back_colors = doc.back_colors

        # PANTONES
        self.front_pantones = list()
        self.back_pantones = list()

        for child in doc.front_pantones:
            fieldname = "front_pantones"
            childcopy = frappe.copy_doc(child)

            self.append(fieldname, childcopy)

        for child in doc.back_pantones:
            fieldname = "back_pantones"
            childcopy = frappe.copy_doc(child)

            self.append(fieldname, childcopy)

    def set_operations(self, assembly=None):
        self.operations = list()

        if not assembly:
            assembly = self.get_product_assembly()

        errmsg = \
            translate("Product Assembly: {} is marked as a Compound Product "
                      "and it has not operations available. You should "
                      "consider creating individual Production Orders for"
                      "each part.")

        if assembly.is_compound_product:
            frappe.throw(errmsg.format(assembly.name))

        def get_department(option):
            doctype = "Product Feature"
            name = option
            fieldname = "department"
            return database.get_value(doctype, name, fieldname)

        def get_parent_department(option):
            name = get_department(option)

            doctype = "Department"
            fieldname = "parent_department"

            return database.get_value(doctype, name, fieldname)

        def get_work_station(option):
            doctype = "Product Feature"
            name = option
            fieldname = "default_work_station"

            return database.get_value(doctype, name, fieldname)

        options = assembly.get_product_options()

        for option in options.split(", "):
            operation = pydict()

            operation.production_order = self.name
            operation.product_feature = option
            operation.department = get_department(option)
            operation.parent_department = get_parent_department(option)
            operation.work_station = get_work_station(option)

            self.append("operations", operation)

    def get_product_assembly(self):
        fields = ("ref_doctype", "ref_docname")

        doctype = "Item"
        name = self.item

        values = database \
            .get_value(doctype, name, fields)

        if values:
            ref_doctype, ref_docname = values

        errmsg = translate("Product Assembly not found for Item: {}")
        if not values or not database \
                .exists(ref_doctype, ref_docname):
            frappe.throw(errmsg.format(name))

        return frappe.get_doc(ref_doctype, ref_docname)

    def update_indexes(self):
        start = 1
        operations = enumerate(self.operations, start)

        for idx, childdoc in operations:
            childdoc.idx = idx

            childdoc.db_update()

    qr_image = None
    naming_series = None
    project_center = None
    status = None
    customer = None
    sales_order = None
    front_pantones = list()
    back_pantones = list()
    product_profile = None
    product_assembly = None
    item = None
    expected_start_date = None
    expected_end_date = None
    actual_start_date = None
    actual_end_date = None
    operations = list()
