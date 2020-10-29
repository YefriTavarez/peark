# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document


class WorkStation(Document):
    def on_change(self):
        self.udpate_department()

    def udpate_department(self):
        department = self.department_5 \
            or self.department_4 \
            or self.department_3 \
            or self.department_2 \
            or self.department_1

        if not department:
            return False

        self.department = department
        self.db_update()

    workstation_name = None
    description = None
    hour_rate_electricity = .000
    hour_rate_consumable = .000
    hour_rate_rent = .000
    hour_rate_labour = .000
    hour_rate = None
    department = None
    department_1 = None
    is_group_1 = False
    department_2 = None
    is_group_2 = False
    department_3 = None
    is_group_3 = False
    department_4 = None
    is_group_4 = False
    department_5 = None
    is_group_5 = False
    holiday_list = None
    working_hours = list()
