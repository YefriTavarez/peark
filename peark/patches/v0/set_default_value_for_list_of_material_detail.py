# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe import db as database


def execute():
    if not database.exists("DocType", "List of Material Detail"):
        return False

    doctype = "List of Material Detail"
    doclist = frappe.get_all(doctype, as_list=True)

    for name, in doclist:
        doc = frappe.get_doc(doctype, name)

        if doc.naming_selection \
                or doc.naming_series:
            continue

        doc.naming_selection = "Naming Series"
        doc.naming_series = "LIST-OF-MATERIAL-DETAIL-"

        doc.db_update()
