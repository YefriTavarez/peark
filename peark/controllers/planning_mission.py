# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

from frappe import get_all
from frappe import get_doc
from frappe import db as database

from frappe.utils import today


def set_to_delayed():
    doctype = "Planning Mission"

    for name in get_all_planning_missions():
        doc = get_doc(doctype, name)

        if not doc.expected_end_date:
            # ignore if it has not been set yet
            continue

        doc.status = "Delayed"

        doc.db_update()

    database.commit()


def get_all_planning_missions():
    namelist = list()

    doctype = "Planning Mission"
    template_doctype = "Planning Mission Template"

    for template_name in \
            get_all_planning_mission_templates():
        template = get_doc(template_doctype, template_name)

        filters = {
            "planning_mission_template": template.name,
            "expected_end_date": ["<", today()],
            "status": template.opening_status,
        }

        for name, in get_all(doctype, filters, as_list=True):
            namelist.append(name)

    return namelist


def get_all_planning_mission_templates():
    doctype = "Planning Mission Template"
    return [name for name,
            in get_all(doctype, as_list=True)]
