# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import frappe


INDEX_NAME = "uniq_pc_sales_order_item"


def execute():
    frappe.reload_doc("peark", "doctype", "project_center")
    add_sales_order_item_column_if_missing()
    normalize_empty_sales_order_item()
    add_unique_index()

    frappe.db.commit()


def add_sales_order_item_column_if_missing():
    if has_column("tabProject Center", "sales_order_item"):
        return

    frappe.db.sql_ddl("""
        Alter Table
            `tabProject Center`
        Add Column
            sales_order_item Varchar(140)
    """)


def normalize_empty_sales_order_item():
    frappe.db.sql_ddl("""
        Update
            `tabProject Center`
        Set
            sales_order_item = Null
        Where
            sales_order_item = ''
    """)


def add_unique_index():
    if has_index("tabProject Center", INDEX_NAME):
        return

    frappe.db.sql_ddl("""
        Alter Table
            `tabProject Center`
        Add Unique Index
            `{index_name}` (sales_order_item)
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
