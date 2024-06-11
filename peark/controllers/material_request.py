# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

from frappe import get_all, get_doc

from frappe import db as database

def notify_for_unresolved():
    doctype = "Material Request"
    filters = {
        "status": "Pending",
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


@frappe.whitelist()
def get_warehouse(user):
    "Set warehouse based on user's cost center as 100 or 200"
    branch = get_employee_branch(user)

    if branch == "Santo Domingo":
        return "Departamento de Produccion Sto. Dgo. - L"
    
    if branch == "Santiago":
        return "Departamento de Produccion Santiago - L"


def get_employee_branch(user_id):
    doctype = "Employee"
    filters = {"user_id": user_id}
    fieldname = ["branch"]

    branch = frappe.db.get_value(
        doctype,
        filters=filters,
        fieldname=fieldname,
    )

    return branch


@frappe.whitelist()
def get_items_from_work_order(work_order):
    doctype = "Work Order"
    
    doc = frappe.get_doc(doctype, work_order)

    items = []

    for item in doc.required_items:
        items.append({
            "item_code": item.item_code,
            "source_warehouse": item.source_warehouse,
            "required_qty": item.required_qty,
        })

    return items