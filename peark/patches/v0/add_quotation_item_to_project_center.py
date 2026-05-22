# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import frappe


INDEX_NAME = "uniq_pc_quotation_item"


def execute():
    frappe.reload_doc("peark", "doctype", "project_center")
    add_quotation_item_column_if_missing()
    normalize_empty_quotation_item()
    add_unique_index()


def add_quotation_item_column_if_missing():
    if has_column("tabProject Center", "quotation_item"):
        return

    frappe.db.sql("""
        Alter Table
            `tabProject Center`
        Add Column
            quotation_item Varchar(140)
    """)


def normalize_empty_quotation_item():
    frappe.db.sql("""
        Update
            `tabProject Center`
        Set
            quotation_item = Null
        Where
            quotation_item = ''
    """)


def add_unique_index():
    if has_index("tabProject Center", INDEX_NAME):
        return

    frappe.db.sql("""
        Alter Table
            `tabProject Center`
        Add Unique Index
            `{index_name}` (quotation_item)
    """.format(index_name=INDEX_NAME))


def has_column(table_name, column_name):
    return bool(frappe.db.sql("""
        Select
            column_name
        From
            information_schema.columns
        Where
            table_schema = Database()
            And table_name = %s
            And column_name = %s
    """, (table_name, column_name)))


def has_index(table_name, index_name):
    return bool(frappe.db.sql("""
        Select
            index_name
        From
            information_schema.statistics
        Where
            table_schema = Database()
            And table_name = %s
            And index_name = %s
    """, (table_name, index_name)))
