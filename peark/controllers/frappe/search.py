# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

from frappe.desk.search import search_widget, build_for_autosuggest


# this is called by the Link Field
@frappe.whitelist()
def search_link(doctype, txt, query=None, filters=None, page_length=20, searchfield=None, reference_doctype=None, ignore_user_permissions=False):
    if doctype == "Item":
        query = "peark.controllers.queries.item_query"

    search_widget(doctype, txt, query, searchfield=searchfield, page_length=page_length, filters=filters,
                  reference_doctype=reference_doctype, ignore_user_permissions=ignore_user_permissions)

    frappe.response['results'] = \
        build_for_autosuggest(frappe.response["values"])

    del frappe.response["values"]
