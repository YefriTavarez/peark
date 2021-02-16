# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

from frappe import get_all, get_doc

from frappe import db as database


def notify_for_unresolved():
    doctype = "Purchase Order"
    filters = {
        "workflow_state": ["In", ["Pendiente Prod.", "Pendiente Adm."]],
        "priority": ["In", ["Urgente", "Muy Urgente"]],
        "creation": [">=", month_start()]
    }

    columns = frappe.cache().hget('columns', doctype)

    if not columns:
        columns = database.sql_list("desc `tab{0}`".format(doctype))
        frappe.cache().hset('columns', doctype, columns)

    doclist = frappe.get_all(doctype, filters, as_list=True)

    for name, in doclist:
        doc = frappe.get_doc(doctype, name)

        doc.run_method("send_reminder_alert")


def month_start():
    from frappe.utils import today, cstr

    today_in_parts = cstr(today()) \
        .split("-")

    # be the first of every month
    today_in_parts[2] = "01"

    return "-".join(today_in_parts)
