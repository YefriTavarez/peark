# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

import frappe

from frappe import db as database
from frappe.utils import cstr

from peark.controllers.project_center import auto_set_status


@frappe.whitelist()
def toggle_task_status(doctype, name, action):
    method = "peark.controllers.task_center._toggle_task_status"
    queue = "long"

    frappe.enqueue(method, queue, doctype=doctype, name=name, action=action)
    # _toggle_task_status(doctype, name, action)


def _toggle_task_status(doctype, name, action):
    """Toggle Task Status
        :param doctype: Task
        :param name: Task ID
        :param action: close or open
    """
    if action not in ("close", "open"):
        frappe.throw("Invalid action")

    fieldname = "status"
    value = "Completed" if action == "close" else "Open"

    # load the task to do a db_update instead db_set or frappe.db.set_value
    # all to prevent any internal trigger in the framework for the involved doctypes
    doc = frappe.get_doc(doctype, name)
    db_status = doc.status
    doc.status = value
    doc.db_update()

    update_project_center_status(name, prev_status=db_status, action=action)


def update_project_center_status(task_id, prev_status=None, action=None):
    try:
        project_center_id = get_project_center_id(task_id)
    except frappe.ValidationError as e:
        frappe.log_error(
            e.message,
            "Task Center: update_project_center_status",
        )
    else:
        auto_set_status(project_center_id, prev_status, action)
        update_project_status(task_id)


def update_project_status(task_id):
    project = _get_project_id(task_id)

    if not project:
        raise frappe.ValidationError("Missing Project ID on Task")

    project_doc = frappe.get_doc("Project", project)

    # update project status
    # 1. get all tasks
    # 2. if all tasks are completed, set project status to completed
    # 3. if any task is open, set project status to open
    # 4. if any task is delayed, set project status to delayed

    tasks = frappe.get_all(
        "Task", filters={"project": project}, fields=["status"])

    if not tasks:
        project_doc.status = "Open"
    elif all(task.status == "Completed" for task in tasks):
        project_doc.status = "Completed"
    else:
        if any(task.status == "Delayed" for task in tasks):
            project_doc.status = "Delayed"
        else:
            project_doc.status = "Open"

    # finally update project status
    project_doc.db_update()


def get_project_center_id(task_id):
    project_center_id = _get_project_center_id(task_id)

    if not project_center_id:
        raise frappe.ValidationError("Missing Project ID on Task")

    return project_center_id


def _get_project_center_id(task_id):
    """Get Project ID from the Project ID set in the task itself"""

    # it can be something like
    # SUB-PROJECT-00000-00 and need to return something like
    # PROJECT-CENTER-00000
    # So, we need only the first part before the last -00
    _project = _get_project_id(task_id)
    parts = cstr(_project).split("-")

    if parts:
        proto_project_center = "-".join(parts[0:3])

        return proto_project_center \
            .replace("SUB-PROJECT", "PROJECT-CENTER")

    return None


def _get_project_id(task_id):
    doc = get_task(task_id)

    return doc.project


def get_task(name):
    doctype = "Task"
    return frappe.get_doc(doctype, name)
