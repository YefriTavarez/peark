# -*- coding: utf-8 -*-
# Copyright (c) 2021, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

from frappe import get_all
from frappe import get_doc
from frappe import db as database

from frappe.utils import today


def set_to_delayed():
    doctype = "Project"

    for name in get_all_projects():
        doc = get_doc(doctype, name)

        if not doc.expected_end_date:
            # ignore if it has not been set yet
            continue

        doc.status = "Delayed"

        doc.db_update()

    database.commit()


def get_all_projects():

    # todo: fetch directly from the project
    namelist = list()

    doctype = "Project"
    template_doctype = "Project Template"

    for template_name in \
            get_all_project_templates():
        template = get_doc(template_doctype, template_name)

        filters = {
            "project_template": template.name,
            "expected_end_date": ["<", today()],
            "status": "Open",
        }

        for name, in get_all(doctype, filters, as_list=True):
            namelist.append(name)

    return namelist


def get_all_project_templates():
    doctype = "Project Template"
    return [name for name,
            in get_all(doctype, as_list=True)]
