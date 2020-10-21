# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document
from frappe import _ as translate


class PlanningMission(Document):
    def onload(self):
        self.load_mission_template()

    def load_mission_template(self, planning_mission_template=None):
        if not planning_mission_template:
            planning_mission_template = self.get_planning_mission_template()

            # fetch the whole object from database
            planning_mission_template.reload()

        key = "planning_mission_template"
        value = planning_mission_template

        self.set_onload(key, value)

    def get_planning_mission_template(self):
        errmsg = translate("Missing value for Planning Template")
        if not self.planning_mission_template:
            frappe.throw(errmsg)

        doctype = self.meta.get_field("planning_mission_template") \
            .options

        name = self.planning_mission_template

        return frappe.get_doc(doctype, name)

    subject = None
    planning_document = None
    planning_mission_template = None
    weight = None
    status = None
    company = None
    description = None
    expected_start_date = None
    expected_end_date = None
    expected_time = None
    review_date = None
    actual_start_date = None
    actual_end_date = None
    actual_time = None
    closing_date = None
    data_to_ask = None
    department = None
    depends_on = list()
    completed_by = None
    total_costing_amount = .000
    total_expense_claim = .000
    total_billing_amount = .000
