# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals


import frappe


def update_last_purchase_rate(purchase_order, method=None):
    for purchase_order_item in purchase_order.items:
        update_item_reference_by_item(purchase_order_item)
        update_item_reference_by_item_group(purchase_order_item)
        update_item_reference_by_item_set(purchase_order_item)


def update_item_reference_by_item(purchase_order_item):
    last_purchase_rate_based_on = "Item"
    purchased_item_code = purchase_order_item.item_code

    # get items
    doctype = "Coating Usage"
    filters = {
        "item": purchased_item_code,
    }

    coating_usages = \
        frappe.get_list(doctype, filters, as_list=True)

    for coating_usage, in coating_usages:
        update_coating_usage(coating_usage,
                             purchase_order_item,
                             last_purchase_rate_based_on)


def update_item_reference_by_item_group(purchase_order_item):
    last_purchase_rate_based_on = "Item Group"
    purchased_item_group = purchase_order_item.item_group

    # get items
    doctype = "Coating Usage"
    filters = {
        "item_group": purchased_item_group,
    }

    coating_usages = \
        frappe.get_list(doctype, filters, as_list=True)

    for coating_usage, in coating_usages:
        update_coating_usage(coating_usage,
                             purchase_order_item,
                             last_purchase_rate_based_on)


def update_item_reference_by_item_set(purchase_order_item):
    last_purchase_rate_based_on = "Item Set"
    purchased_item_code = purchase_order_item.item_code

    # get items
    doctype = "Item Set"
    filters = {
        "item": purchased_item_code,
    }

    fieldname = "parent"

    coating_usages = \
        frappe.get_list(doctype, filters,
                        fieldname, as_list=True)

    for coating_usage, in coating_usages:
        update_coating_usage(coating_usage,
                             purchase_order_item,
                             last_purchase_rate_based_on)


def update_coating_usage(coating_usage,
                         purchase_order_item,
                         last_purchase_rate_based_on):
    doctype = "Coating Usage"
    name = coating_usage

    coating_usage_doc = \
        frappe.get_doc(doctype, name)

    coating_usage_doc \
        .update({
            "last_purchase_item": purchase_order_item.item_code,
            "last_purchase_rate": purchase_order_item.base_rate,
            "last_purchase_uom": purchase_order_item.uom,
        })

    if coating_usage_doc.last_purchase_rate_based_on \
            != last_purchase_rate_based_on:
        return None

    coating_usage_doc \
        .db_update()

    return coating_usage_doc
