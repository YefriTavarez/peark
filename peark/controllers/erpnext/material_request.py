# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

import frappe

from frappe import db as database


def on_change(doc, method=None):
    update_production_planning_tool(doc)


def on_cancel(doc, method=None):
    update_production_planning_tool(doc)


def on_submit(doc, method=None):
    send_specific_items_notification(doc)


def send_specific_items_notification(doc):

    specifict_items = [
        "PRSE0456",
        "PRSE0458",
        "SUSU0003",
    ]

    for item in doc.items:
        if item.item_code in specifict_items:
            doc.run_method("send_specific_items_notification")


def update_production_planning_tool(doc):
    field = doc.meta.get_field("production_planning_tool")

    if not field:
        return False

    doctype = field.options
    name = doc.production_planning_tool
    fieldname = "material_request_status"
    value = doc.status

    if not name:
        return False

    database.set_value(doctype, name, fieldname, value)
