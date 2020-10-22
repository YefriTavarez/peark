# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

from frappe.utils import today, add_days
from frappe.utils import cint, flt, cstr

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


def get_opening_status(doc):
    doc.reload()

    if doc.depends_on:
        return "Open"

    return "Pending"


def get_expected_end_date(doc):
    expected_time = cint(doc.expected_time)
    expected_start_date = cstr(doc.expected_start_date)

    return add_days(expected_start_date, expected_time)


def make_planning_document(source_name, target_doc=None, ignore_permissions=False):

    if not target_doc:
        target_doc = frappe.new_doc("Planning Document")

    if target_doc:
        target_doc.missions = list()

    def set_missing_values(source, target):
        # target.run_method("calculate_taxes_and_totals")
        
        prevdoc = None
        
        for childoc in target.missions:
            if childoc.status == "Pending":
                childoc.expected_start_date = today()
            else:
                if not prevdoc:
                    childoc.expected_start_date = today()
                else:
                    childoc.expected_start_date = prevdoc.expected_end_date

            childoc.expected_end_date = get_expected_end_date(childoc)

            # for next child
            prevdoc = childoc


    def update_item(source, target, source_parent):
        target.status = get_opening_status(source)


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
                "default_status_workflow": "status_workflow",
                # "parent": "planning_document",
            },
            "postprocess": update_item
        },
    }, target_doc, set_missing_values, ignore_permissions=ignore_permissions)

    # postprocess: fetch shipping address, set missing values

    return doclist
