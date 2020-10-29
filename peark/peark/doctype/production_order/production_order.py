# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe import db as database
from frappe import _ as translate
from frappe import _dict as pydict


class ProductionOrder(Document):
    def on_change(self):
        self.update_indexes()

    def validate(self):
        self.validate_item_agaist_product_assembly()

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

    def set_item(self):
        doctype = "Planning Document"
        name = self.planning_document
        fieldname = "item_code"

        if name:
            self.item = database \
                .get_value(doctype, name, fieldname)

    def set_product_name(self):
        doctype = "Planning Document"
        name = self.planning_document
        fieldname = "product_name"

        if name:
            self.product_name = database \
                .get_value(doctype, name, fieldname)

    def set_qty(self):
        doctype = "Planning Document"
        name = self.planning_document
        fieldname = "production_qty"

        if name:
            self.qty = database \
                .get_value(doctype, name, fieldname)

    def set_customer(self):
        doctype = "Planning Document"
        name = self.planning_document
        fieldname = "customer"

        if name:
            self.customer = database \
                .get_value(doctype, name, fieldname)

    def set_sales_order(self):
        doctype = "Planning Document"
        name = self.planning_document
        fieldname = "sales_order"

        if name:
            self.sales_order = database \
                .get_value(doctype, name, fieldname)

    def set_product_profile(self):
        doc = self.get_product_assembly()

        self.product_profile = doc.product_profile

    def set_product_assembly(self):
        doc = self.get_product_assembly()

        self.product_assembly = doc.name

    def set_operations(self):
        self.operations = list()

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

    naming_series = None
    planning_document = None
    status = None
    customer = None
    sales_order = None
    product_profile = None
    product_assembly = None
    item = None
    expected_start_date = None
    expected_end_date = None
    actual_start_date = None
    actual_end_date = None
    operations = list()
