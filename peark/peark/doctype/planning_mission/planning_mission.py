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

    def on_change(self):
        self.update_percentage_completed()

    def validate(self):
        self.update_completed_by()
        self.validate_planning_document()
        self.update_parent_with_planning_template()
        self.set_description_if_missing()

    def set_description_if_missing(self):
        if not self.description:
            self.description = self.subject

    def load_mission_template(self, planning_mission_template=None):
        if not planning_mission_template:
            planning_mission_template = self.get_planning_mission_template()

            # fetch the whole object from database
            planning_mission_template.reload()

        key = "planning_mission_template"
        value = planning_mission_template

        self.set_onload(key, value)

    def validate_planning_document(self):
        if self.planning_document:
            return True

        errmsg = translate("Missing Value for Planning Document field")

        frappe.throw(errmsg)

    def update_parent_with_planning_template(self):
        self.parentfield = "missions"
        self.parenttype = "Planning Document"

        self.parent = self.planning_document

        self.db_update()

    def update_completed_by(self):
        status = self.status
        db_status = self.db_get("status")

        if status == db_status:
            return False

        completed_by = self.completed_by
        db_completed_by = self.db_get("completed_by")

        if status != "Completed":
            return False

        # it is in completed status
        # if the user just set the user leave it
        # set it to the current user otherwise
        if completed_by != db_completed_by:
            return False

        self.completed_by = frappe.session.user

    def update_percentage_completed(self):
        doctype = self.parenttype
        name = self.parent

        doc = frappe.get_doc(doctype, name)

        doc.update_percentage_completed()

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
    weight = 0.00
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
