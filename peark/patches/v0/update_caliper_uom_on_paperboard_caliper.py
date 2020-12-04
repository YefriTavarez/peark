# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe import db as database


def execute():
    core = "DocType"
    doctype = "Paperboard Caliper"

    if not database.exists(core, doctype):
        return False

    database.sql("""
        Update `tab{0}`
            Set caliper_uom = capliper_uom
        Where
            caliper_uom is null
            And capliper_uom is not null
    """.format(doctype))
