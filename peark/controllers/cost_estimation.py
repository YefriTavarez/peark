# -*- coding: utf-8 -*-
# Copyright (c) 2019, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe import db as database
from frappe import get_all, get_doc
from frappe.utils import nowdate


def set_to_expired():
    doctype = "Cost Estimation"

    all_records = get_expired_and_valid_records()

    for name, in all_records:
        doc = get_doc(doctype, name)

        doc.update_status()

    database.commit()


def get_expired_and_valid_records(as_of=nowdate()):
    doctype = "Cost Estimation"
    filters = {
        "status": "Valid",
        "valid_until": ["<", as_of],
    }

    return get_all(doctype, filters, as_list=True)
