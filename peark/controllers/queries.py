# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

import frappe

from erpnext.controllers.queries import item_query as erpnext_item_query


@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def item_query(doctype, txt, searchfield, start, page_len, filters, as_dict=False):
    parts = txt \
        .strip() \
        .split()

    text = txt
    if parts:
        text = "%".join(parts)

    return erpnext_item_query(doctype, text, searchfield, start, page_len, filters, as_dict)
