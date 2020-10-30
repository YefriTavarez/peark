# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe import db as database


def execute():
    columns = (
        "production_item",
    )

    for column in columns:
        database.sql("""Alter Table
                `tabProduction Order`
            Add {column} Varchar(40) Not Null
        """.format(column=column))
