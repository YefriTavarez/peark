# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc


class PlanningTemplate(Document):
    def validate(self):
        self.validate_cost_center()

    def make_planning_document(self, target_doc=None):
        return make_planning_document(self.name, target_doc=target_doc)

    def validate_cost_center(self):
        # validate against company
        pass

    template_name = None
    planning_document_type = None
    priority = None
    order_required = False
    enabled = True
    responsible = None
    company = None
    cost_center = None
    missions = list()


def make_planning_document(source_name, target_doc=None, ignore_permissions=False):
    if target_doc:
        target_doc.missions = list()

    def set_missing_values(source, target):
        # target.sales_partner=source.referral_sales_partner
        # target.run_method("set_missing_values")
        target.run_method("calculate_taxes_and_totals")

    def update_item(source, target, source_parent):
        target.status = source.opening_status
    # target.stock_qty = flt(obj.qty) * flt(obj.conversion_factor)

    doclist = get_mapped_doc("Planning Template", source_name, {
        "Planning Template": {
            "doctype": "Planning Document",
            "field_map": {
                "responsible": "responsible",
                "name": "planning_template",
            },
            "validation": {
                "enabled": ["=", 1]
            }
        },
        "Planning Mission Template": {
            "doctype": "Planning Mission",
            "field_map": {
                "name": "planning_mission_template",
                # "parent": "planning_document",
            },
            "postprocess": update_item
        },
        # "Sales Taxes and Charges": {
        #     "doctype": "Sales Taxes and Charges",
        #     "add_if_empty": True
        # },
        # "Sales Team": {
        #     "doctype": "Sales Team",
        #     "add_if_empty": True
        # },
        # "Payment Schedule": {
        #     "doctype": "Payment Schedule",
        #     "add_if_empty": True
        # }
    }, target_doc, set_missing_values, ignore_permissions=ignore_permissions)

    # postprocess: fetch shipping address, set missing values

    return doclist
