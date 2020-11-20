# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe import db as database


def execute():
    doctype = "Paperboard"

    if not database.exists("DocType", doctype):
        return False

    doclist = frappe.get_all(doctype)

    for opts in doclist:
        doc = frappe.get_doc(doctype, opts)

        oldname = doc.name
        newname = doc.title

        if newname == oldname:
            continue

        frappe.rename_doc(doctype, newname, oldname, force=True)