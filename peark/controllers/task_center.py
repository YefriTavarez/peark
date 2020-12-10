# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

import frappe

from frappe import db as database


@frappe.whitelist()
def toggle_task_status(doctype, name, action):
    if action not in ("close", "open"):
        frappe.throw("Invalid action")

    fieldname = "status"
    value = "Completed" if action == "close" else "Open"

    database.set_value(doctype, name, fieldname, value)
