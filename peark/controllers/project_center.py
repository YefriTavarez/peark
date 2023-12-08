# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

import frappe

from frappe import get_all, get_doc

from frappe import db as database


def update_projects():
    doctype = "Project Center"

    for project_center in get_all_project_centers():
        name = project_center.name

        doc = get_doc(doctype, name)

        doc.update_projects()


def get_all_project_centers():
    doctype = "Project Center"

    filters = {
        "status": ["!=", "Completed"],
    }

    return get_all(doctype, filters)


def auto_set_status(project_center_id, prev_status=None, action=None):
    doc = get_project_center(project_center_id)
    _auto_set_status(doc, prev_status, action)


def _auto_set_status(project_center, prev_status=None, action=None):
    # prev_status = project_center.db_get("status")

    status_list = list()

    for project in project_center.projects:
        status_list.append(project.status)

    if not status_list:
        project_center.status = "Open"
    elif all(status == "Completed" for status in status_list):
        project_center.status = "Completed"
    else:
        if "Delayed" in status_list:
            project_center.status = "Delayed"
        else:
            project_center.status = "Open"

    current_status = get_project_center_status(project_center.name)
    if current_status != prev_status:
        project_center.run_method("close_work_order_if_applies", current_status=current_status, prev_status=prev_status)
        project_center.db_update()


def get_project_center(name):
    doctype = "Project Center"
    return frappe.get_doc(doctype, name)


def get_project_center_status(project_center_id):
    """Evaluate all tasks of all related sub-projects and tell whether it is completed or not"""
    # default status is completed until proven otherwise
    status = "Completed"

    # get all sub-projects
    sub_projects = get_sub_projects(project_center_id)

    for sub in sub_projects:
        # get all tasks of the sub-project
        tasks = get_tasks(sub.name)

        if not tasks:
            continue

        if any(task.status != "Completed" for task in tasks):
            status = "Open"

    return status


def get_sub_projects(project_center_id):
    doctype = "Project"
    filters = {
        "name": ["like", f"{project_center_id}%"],
    }

    order_by = "name asc"

    return get_all(doctype, filters, order_by=order_by)


def get_tasks(project_id):
    doctype = "Task"
    filters = {
        "project": project_id,
    }

    fields = ["status"]

    return frappe.get_all(doctype, filters, fields)