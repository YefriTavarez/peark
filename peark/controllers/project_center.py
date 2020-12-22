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
