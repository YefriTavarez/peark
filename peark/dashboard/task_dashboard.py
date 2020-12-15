# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals


import frappe
from frappe.model.db_query import DatabaseQuery

from frappe import _ as translate


@frappe.whitelist()
def get_data(project=None, project_center=None, status=None, start=0, sort_by='creation', sort_order='desc'):
    filters = list()

    if project:
        filters.append(['project', '=', project])

    if status:
        if status == "Not Completed":
            filters.append(['status', '!=', "Completed"])
        else:
            filters.append(['status', '=', status])

    if project_center:
        projects = frappe.get_all("Projects", {
            "parent": project_center,
            "parentfield": "projects",
            "parenttype": "Project Center",
        }, "project", as_list=True)

        filters.append(['project', 'in', [d for d, in projects]])

    try:
        doctype = 'Department'
        user = frappe.session.user
        database_query = DatabaseQuery(doctype, user=user)

        if database_query.build_match_conditions():
            departments = [d.name for d in frappe.get_list('Department')]
            filters.append(['department', 'in', departments])
    except frappe.PermissionError:
        return []

    items = frappe.get_list("Task", filters=filters, fields="*")

    for item in items:
        item.translated_status = translate(item.status)

    return items
