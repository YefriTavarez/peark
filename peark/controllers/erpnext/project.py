# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import add_days
from frappe import db as database
from frappe import get_all

from frappe import _ as translate
from frappe.model.naming import make_autoname


def autoname(doc, method):
    set_new_name(doc)


def onload(doc, method=None):
    add_project_task(doc)


def after_insert(doc, method=None):
    enqueue_tasks_update(doc)


def validate(doc, method=None):
    enqueue_tasks_update(doc)


def set_new_name(doc):
    set_naming_series(doc)
    doc.name = make_autoname(doc.naming_series)


def set_naming_series(doc):
    if not doc.get("naming_series"):
        doc.naming_series = "SUB-PROJECT-"

        if not doc.get("project_center"):
            return False

        doc.naming_series = "{0}-.##".format(doc.project_center)


def enqueue_tasks_update(doc):
    frappe.enqueue("peark.controllers.erpnext.project.update_projects",
                   enqueue_after_commit=True, timeout=40000)


def on_trash(doc, method=None):
    delete_tasks(doc)


def add_project_task(doc):
    project_tasks = get_project_taks(doc)

    doc.set_onload("project_tasks", project_tasks)


def get_project_taks(doc):
    doctype = "Task"
    project = doc.name

    filters = {
        "project": project,
    }

    fields = "*"

    return get_all(doctype, filters, fields, order_by="idx Asc")


def update_projects():
    doctype = "Project"
    filters = {
        "updated_tasks": False,
    }

    for name, in get_all(doctype, filters, as_list=True):
        doc = frappe.get_doc(doctype, name)

        update_tasks(doc)

        doc.db_set("updated_tasks", True)

    database.commit()


def update_tasks(doc):
    doctype = "Project Template"
    docname = doc.project_template

    if not docname:
        return False

    template = frappe.get_doc(doctype, docname)

    # update tasks from template
    for task in template.tasks:
        doctype = "Task"
        filters = {
            "subject": task.subject,
            "project": doc.name,
            "task_weight": task.task_weight,
        }

        exists = database.exists(doctype, filters)

        if not exists:
            continue

        taskdoc = frappe.get_doc(doctype, filters)

        taskdoc.update({
            "department": doc.department,
            "idx": task.idx,
        })

        taskdoc.flags.ignore_permissions = True
        taskdoc.save()


def delete_tasks(doc):
    doctype = "Task"
    project = doc.name

    filters = {
        "project": project,
    }

    for name, in get_all(doctype, filters, as_list=True):
        frappe.delete_doc(doctype, name)


@frappe.whitelist()
def update_task(name, status):
    def update_project(task):
        doctype = "Project"
        name = task.get("project")

        doc = frappe.get_doc(doctype, name)

        doc.run_method("update_percent_complete")
        doc.db_update()

        return doc.as_dict()

    doctype = "Task"

    doc = frappe.get_doc(doctype, name)

    if status not in ("Open", "Completed"):
        return False

    doc.status = status

    if status == "Completed":
        doc.completed_by = frappe.session.user

        comment_type = "Edit"
        text = translate("Completed By")
        doc.add_comment(comment_type, "{}: {}".format(text, doc.completed_by))
    else:
        doc.completed_by = None

    doc.db_update()

    return update_project(doc)
