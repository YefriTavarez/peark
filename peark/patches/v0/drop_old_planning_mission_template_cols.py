# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe import db as database

def execute():
    columns = (
        "expected_start_date",
        "expected_end_date",
        "actual_start_date",
        "actual_time",
        "actual_end_date",
    )

    for column in columns:
        database.sql("""Alter Table
                `tabPlanning Mission Template`
            Drop Column If Exists {column}
        """.format(column=column))