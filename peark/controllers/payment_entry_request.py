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
    doctype = "Payment Entry Request"

    for name, in get_all_payment_entry_request():
        doc = get_doc(doctype, name)

        if not doc.due_date:
            # ignore if it has not been set yet
            continue

        doc.status = "Overdue"

        doc.db_update()

    database.commit()


def get_all_payment_entry_request():
    doctype = "Payment Entry Request"

    filters = {
        "due_date": ["<", today()],
        "workflow_state": "Pendiente",
        "status": ["!=", "Overdue"],
    }

    return get_all(doctype, filters, as_list=True)
