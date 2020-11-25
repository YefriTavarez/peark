# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document
from frappe.model.naming import make_autoname

from frappe.utils import flt
from frappe import _ as translate


class ProjectCenter(Document):
    # def after_insert(self):
    #     self.generate_projects()

    def after_insert(self):
        # if not self.is_new():
        self.generate_projects()

    def validate(self):
        self.update_title()
        self.validate_production_qty()

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

        if self.get("product_name"):
            title = "{} ({})".format(title, self.product_name)

        if self.get("item_specifications"):
            title = "{} {}".format(title, self.item_specifications)

        self.title = title

    def generate_projects(self):
        def append_child(doc, template):
            doctype = "Projects"
            childdoc = frappe.new_doc(doctype)

            childdoc.update({
                "project": doc.name,
                "project_title": doc.title,
                "department": template.department,
                "parent": self.name,
                "parenttype": self.doctype,
                "parentfield": "projects",
            })

            childdoc.save(ignore_permissions=True)

        def set_missing_values(doc, template):
            doc.update({
                "expected_start_date": self.expected_start_date,
                "expected_end_date": self.expected_end_date,
                "title": self.title,
                "project_name": self.product_name,
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

        for template in template.get("templates", []):
            doctype = "Project"

            doc = frappe.new_doc(doctype)

            set_missing_values(doc, template)

            doc.project_template = template.project_template

            doc.save()

            # update projects table
            append_child(doc, template)

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
