# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
import json


@frappe.whitelist()
def make_mapped_doc(method, source_name, selected_children=None, args=None):
    '''Returns the mapped document calling the given mapper method.
    Sets selected_children as flags for the `get_mapped_doc` method.

    Called from `open_mapped_doc` from create_new.js'''
    method = frappe.get_attr(method)

    if method not in frappe.whitelisted:
        raise frappe.PermissionError

    if selected_children:
        selected_children = json.loads(selected_children)

    if args:
        frappe.flags.args = frappe._dict(json.loads(args))

    frappe.flags.selected_children = selected_children or None

    # frappe.errprint(method)

    from erpnext.stock.doctype.material_request.material_request import make_purchase_order
    if method == make_purchase_order:
        doctype = "Material Request"

        doc = frappe.get_doc(doctype, source_name)

        doc.tc_name = None

        doc.db_update()

    return method(source_name)
