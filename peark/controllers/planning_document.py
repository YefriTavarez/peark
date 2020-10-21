# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

from frappe import get_all, get_doc

from frappe import db as database

from frappe.utils import today


def set_to_delayed():
    doctype = "Planning Document"

    for planning_document in get_all_planning_documents():
        name = planning_document.name

        doc = get_doc(doctype, name)

        if not doc.expected_end_date:
            # ignore if it has not been set yet
            continue

        doc.status = "Delayed"

        doc.db_update()

    database.commit()


def get_all_planning_documents():
    doctype = "Planning Document"

    filters = {
        "expected_end_date": ["<", today()],
        "status": "Open",
    }

    return get_all(doctype, filters)
