# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe import db as database
from frappe import _ as translate
from frappe import get_doc, get_all

from frappe.utils import flt


class ProjectCenter(Document):
    def onload(self):
        self.update_projects(force=True)

    def after_insert(self):
        self.generate_projects()
        self.set_missing_values_on_children()

    def on_update(self):
        self.set_missing_values_on_children()

    def validate(self):
        self.update_title()
        self.validate_production_qty()

    def update_projects(self, autocommit=True, force=False):
        if not force:
            return False

        status_list = list()

        def update_child_project(project):
            doctype = "Project"
            name = project.project

            fieldname = "status"

            value = frappe.get_value(doctype, name, fieldname)

            if value != project.status:
                project.set(fieldname, value)
                project.db_update()

            return project.status

        # remember project center status
        prev_status = self.status

        for project in self.projects:
            status = update_child_project(project=project)

            status_list.append(status)

        # just a bit of config
        status_change_comment = translate("Set to {}")

        if all(status == "Completed" for status in status_list):
            self.status = "Completed"
        else:
            if "Delayed" in status_list:
                self.status = "Delayed"
            else:
                self.status = "Open"

        if prev_status != self.status:
            comment = status_change_comment \
                .format(self.status)

            self.add_comment("Edit", comment)

            self.db_update()

        if autocommit:
            frappe.db.commit()

    def set_missing_values_on_children(self):
        projects = self.get_projects()

        for d in projects:
            d.update_missing_values()

    def get_projects(self):
        doctype = "Projects"

        filters = {
            "parent": self.name,
            "parenttype": "Project Center",
            "parentfield": "projects",
        }

        fields = "name"

        doclist = get_all(doctype, filters, fields, as_list=True)

        return [get_doc(doctype, name) for name, in doclist]

    def validate_production_qty(self):
        if flt(self.production_qty):
            return True

        errmsg = translate("Missing Fields")
        field = translate("Production Qty")

        frappe.throw("{}: {}".format(errmsg, field))

    def update_title(self):
        title = ""

        if self.get("project_type"):
            title = "{}: {}".format(self.project_type, title)

        if self.get("customer"):
            title = "{} {}".format(title, self.customer)

        if self.get("product_name"):
            title = "{} ({})".format(title, self.product_name)

        if self.get("item_specifications"):
            title = "{} {}".format(title, self.item_specifications)

        self.title = title

    def generate_projects(self):
        def set_fetch_from(doc):
            doctype = "Task"

            kwargs = {
                "filters": {
                    "project": doc.name,
                },
                "fields": "name",
                "as_list": True,
            }

            doclist = frappe.get_all(doctype, **kwargs)

            for name, in doclist:
                doc = frappe.get_doc(doctype, name)

                doc.project_title = self.title
                doc.title = "{}: {}" \
                    .format(self.name, self.title)

                # persists changes
                doc.db_update()

        def append_child(doc, template, idx):
            doctype = "Projects"
            childdoc = frappe.new_doc(doctype)

            childdoc.update({
                "project": doc.name,
                "project_title": doc.title,
                "department": template.department,
                "parent": self.name,
                "parenttype": self.doctype,
                "parentfield": "projects",
                "idx": idx,
            })

            childdoc.save(ignore_permissions=True)

        def set_missing_values(doc, template):
            doc.update({
                "expected_start_date": self.expected_start_date,
                "expected_end_date": self.expected_end_date,
                "title": self.title,
                "project_name": self.product_name,
                "sales_order": self.sales_order,
                "customer": self.customer,
                "project_type": self.project_type,
                "priority": self.priority,
                "department": template.department,
                "item_specifications": self.item_specifications,
            })

        def get_template():
            doctype = "Project Center Template"
            name = self.project_center_template

            errmsg = translate("Missing Fields")
            if not name:
                frappe.throw("{}: {}".format(errmsg, doctype))

            return frappe.get_doc(doctype, name)

        template = get_template()

        if self.is_new():
            self.projects = list()

        templates = template.get("templates", list())
        for idx, template in enumerate(templates, start=1):
            doctype = "Project"

            doc = frappe.new_doc(doctype)

            set_missing_values(doc, template)

            doc.project_template = template.project_template

            # fake field for project center
            doc.project_center = self.name

            doc.save()

            # update projects table
            set_fetch_from(doc)
            append_child(doc, template, idx)

    def get_product_assembly(self):
        item_doc = self.get_item_doc()

        doctype = item_doc.ref_doctype
        name = item_doc.ref_docname

        errmsg = translate("Product Assembly not found for Item: {}")
        if not database \
                .exists(doctype, name):
            frappe.throw(errmsg.format(item_doc.name))

        return frappe.get_doc(doctype, name)

    def get_item_doc(self):
        doctype = "Item"
        name = self.item_code

        errmsg = translate("Item Code is missing")

        if not name:
            frappe.throw(errmsg)

        return frappe.get_doc(doctype, name)

    project_naming_series = None
    title = None
    project_center_template = None
    project_type = None
    status = None
    naming_series = None
    order_required = None
    customer = None
    product_name = None
    sales_order = None
    item_code = None
    item_name = None
    item_specifications = None
    production_qty = 0
    priority = None
    expected_start_date = None
    expected_end_date = None
    actual_start_date = None
    actual_end_date = None
    projects = list()
