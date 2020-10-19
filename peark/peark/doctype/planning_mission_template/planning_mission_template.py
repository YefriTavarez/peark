# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

from frappe import _ as translate
from frappe.model.document import Document


class PlanningMissionTemplate(Document):
    def validate(self):
        if not self.description:
            self.description = self.subject

        self.validate_all_status()
        self.validate_planning_template()

    def on_change(self):
        self.update_parent_with_planning_template()

    def validate_all_status(self):
        def get_label_for(fieldname):
            return self.meta.get_field(fieldname) \
                .label

        def get_all_status():
            return map(lambda d: d.planning_mission_status, self.possible_status)

        status_fields = (
            "opening_status",
            "closing_status",
            "overdue_status",
        )

        for fieldname in status_fields:
            value = self.get(fieldname)
            label = get_label_for(fieldname)

            errmsg = translate("Missing Value for fieldname {}")
            if not value:
                frappe.throw(errmsg.format(label))

            errmsg = translate("Invalid Status {} for fieldname {}")
            if value not in get_all_status():
                frappe.throw(errmsg.format(value, label))

    def validate_planning_template(self):
        if self.planning_template:
            return True

        errmsg = translate("Missing Value for Planning Template field")

        frappe.throw(errmsg)

    def update_parent_with_planning_template(self):
        self.parentfield = "missions"
        self.parenttype = "Planning Template"

        self.parent = self.planning_template

        self.db_update()

    subject = None
    planning_template = None
    department = None
    weight = None
    expected_time = None
    data_to_ask = []
    possible_status = []
    description = None
    depends_on = []
