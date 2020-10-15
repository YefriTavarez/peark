# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

import frappe

from frappe import db as database
from frappe import _dict as pydict

from frappe.utils import cint, cstr
from frappe.utils.nestedset import get_root_of


def autoname(doc, method=None):
    make_new_name(doc)


def before_rename(doc, method, old, new, merge=False):

    # doc vars
    item_group_name = doc.item_group_name
    item_group_code = cstr(doc.item_group_code).zfill(2)

    new_name = u" - ".join((item_group_code, item_group_name))

    if " - " in new:
        return new

    return new_name


def make_new_name(doc):
    set_item_group_code(doc)

    # doc vars
    item_group_name = doc.item_group_name
    item_group_code = cstr(doc.item_group_code).zfill(2)

    new_name = u" - ".join((item_group_code, item_group_name))

    if not doc.is_new():
        return False

    doc.name = new_name


def set_item_group_code(doc):
    item_group_root = get_item_group_root()

    # doc vars
    item_group_name = doc.item_group_name
    parent_item_group = doc.parent_item_group

    if item_group_name == item_group_root:
        return False

    next_item_group_code = get_next_item_group_code(parent_item_group)

    doc.item_group_code = cstr(next_item_group_code).zfill(2)


def get_item_group_root():
    doctype = "Item Group"

    return get_root_of(doctype)


def get_next_item_group_code(parent_item_group):
    current_code = get_current_item_group_code(parent_item_group)

    return current_code + 1


def get_current_item_group_code(parent_item_group):
    filters = pydict(parent_item_group=parent_item_group)

    result = database.sql("""
        Select
            Max(item_group_code)
        From
            `tabItem Group`
        Where
            parent_item_group = %(parent_item_group)s
    """, filters)

    return cint(result[0][0])


def get_item_group_doc(item_group):
    doctype = "Item Group"
    filters = {
        "item_group_name": item_group,
    }

    exists = database.exists(doctype, filters)

    doc = frappe.new_doc(doctype)

    if exists:
        doc = frappe.get_doc(doctype, filters)

    return doc
