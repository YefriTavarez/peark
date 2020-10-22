# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

from frappe import db as database
from frappe import _ as translate

from frappe.model.document import Document


class PlanningDocument(Document):
    def onload(self):
        self.load_planning_template()

    def on_change(self):
        pass

    def validate(self):
        self.update_children_status()
        self.update_planning_document()

    def update_children_status(self):
        status = self.status
        status_list = ("Stopped", "Paused", "Cancelled")

        if not status in status_list:
            db_status = self.db_get("status")

            if db_status in status_list:
                for childoc in self.missions:
                    if childoc.status in (db_status,):
                        continue

                    childoc.status = "Pending"

                    childoc.db_update()

            return False

        for childoc in self.missions:
            if childoc.status in ("Completed",):
                continue

            childoc.status = status

            childoc.db_update()

        return True

    def update_planning_document(self):
        for childoc in self.missions:
            childoc.planning_document = self.name

    def load_planning_template(self, planning_template=None):
        if not planning_template:
            planning_template = self.get_planning_template()

        for mission in planning_template.missions:
            # mission = frappe.get_doc(mission.doctype, mission.name)
            mission.reload()

        key = "planning_template"
        value = planning_template

        self.set_onload(key, value)

    def get_planning_template(self):
        errmsg = translate("Missing value for Planning Template")
        if not self.planning_template:
            frappe.throw(errmsg)

        doctype = self.meta.get_field("planning_template") \
            .options

        name = self.planning_template

        return frappe.get_doc(doctype, name)

    def fetch_from_planning_template(self):
        planning_template = self.get_planning_template()

        self.load_planning_template(planning_template)

        planning_template.make_planning_document(self)

        return self

    def get_item_code_specs(self):
        # todo: consider deleting this unused method
        self.validate_if_doc_exists()

        item_doc = self.get_item_doc()
        self.item_specifications = item_doc.description

    def get_product_assembly(self):
        item_doc = self.get_item_doc()

        doctype = item_doc.ref_doctype
        name = item_doc.ref_docname

        return frappe.get_doc(doctype, name)

    def validate_if_doc_exists(self):
        item_doc = self.get_item_doc()

        doctype = item_doc.ref_doctype
        name = item_doc.ref_docname

        errmsg = translate("This Item cannot be used as it does "
                           "not have a Product Profile")

        if not doctype or not name:
            frappe.throw(errmsg)

        errmsg = translate("This Item cannot be used as its "
                           "references to a Product Profile does not exist anymore")

        if not database.exists(doctype, name):
            frappe.throw(errmsg)

    def get_item_doc(self):
        doctype = "Item"
        name = self.item_code

        errmsg = translate("Item Code is missing")

        if not name:
            frappe.throw(errmsg)

        return frappe.get_doc(doctype, name)

    title = None
    planning_template = None
    planning_document_type = None
    status = None
    responsible = None
    item_code = None
    item_name = None
    item_specifications = None
    production_qty = None
    priority = None
    order_required = None
    customer = None
    sales_order = None
    product_name = None
    percent_complete = None
    expected_start_date = None
    company = None
    cost_center = None
    expected_end_date = None
    missions = list()
    estimated_costs = None
    total_purchase_order = None
    total_sales_invoice = None
    total_costing_amount = None
    margin = None
    gross_margin = None
