# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

import frappe

from frappe import get_doc
from frappe import db as database

from frappe.utils import cstr

from frappe.model.naming import make_autoname


def onload(doc, method):
    set_creator_object(doc)


def before_insert(doc, method):
    # update naming series just before insert
    set_naming_series(doc)


def on_update(doc, method):
    update_item_group(doc)


def update_item_group(doc):
    item_group = doc.item_group_4 \
        or doc.item_group_3 \
        or doc.item_group_2 \
        or doc.item_group_1

    doc.item_group = item_group


def set_new_item_code(doc):
    # doc.name =
    get_new_item_code(doc)


def get_new_item_code(doc):
    set_naming_series(doc)
    # return make_autoname(doc.naming_series)


def set_naming_series(doc):
    doc.naming_series = get_item_code_naming_serie(doc)
    # frappe.throw(doc.naming_series)


def get_item_code_naming_serie(doc):
    serie = str()

    padding_char = "0"
    placeholder = "####"

    for item_group in (doc.item_group_1, doc.item_group_2,
                       doc.item_group_3, doc.item_group_4):
        code = get_item_group_code(item_group)

        # concatenate
        serie = "{serie}{code}".format(code=code, serie=serie)

    # right padding
    serie = serie.ljust(8, padding_char)
    return ".".join((serie, placeholder))


def get_item_group_code(item_group):
    return cstr(item_group).split(" - ")[0]


def get_item_doc(doctype, docname, cdt=None, cdn=None):
    item_doctype = "Item"

    filters = {
        "ref_doctype": doctype,
        "ref_docname": docname,
    }

    if cdt and cdn:
        filters.update({
            "ref_childtype": cdt,
            "ref_childname": cdn,
        })

    if database.exists(item_doctype, filters):
        return get_doc(item_doctype, filters)

    return frappe.new_doc(item_doctype)


def set_creator_object(doc):
    doctype = doc.ref_doctype
    docname = doc.ref_docname

    if doctype and docname:
        if database.exists(doctype, docname):
            creator_doc = get_doc(doctype, docname)

            doc.set_onload("creator", creator_doc)
            doc.set_onload("is_child_creator", False)
    else:
        doc.set_onload("creator", {})

    childdoctype = doc.ref_childtype
    childdocname = doc.ref_childname

    if childdoctype and childdocname:
        if database.exists(childdoctype, childdocname):
            creator_doc = get_doc(childdoctype, childdocname)

            doc.set_onload("creator", creator_doc)
            doc.set_onload("is_child_creator", False)
