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
    doctype = "List of Material Detail"
    filters = {
        "parentfield": "items",
        "parenttype": "List of Material",
        "item": purchased_item_code,
    }

    list_of_material_details = \
        frappe.get_list(doctype, filters, as_list=True)

    for list_of_material_detail, in list_of_material_details:
        update_list_of_material_detail(list_of_material_detail,
                                       purchase_order_item,
                                       last_purchase_rate_based_on)


def update_item_reference_by_item_group(purchase_order_item):
    last_purchase_rate_based_on = "Item Group"
    purchased_item_group = purchase_order_item.item_group

    # get items
    doctype = "List of Material Detail"
    filters = {
        "parentfield": "items",
        "parenttype": "List of Material",
        "item_group": purchased_item_group,
    }

    list_of_material_details = \
        frappe.get_list(doctype, filters, as_list=True)

    for list_of_material_detail, in list_of_material_details:
        update_list_of_material_detail(list_of_material_detail,
                                       purchase_order_item,
                                       last_purchase_rate_based_on)


def update_item_reference_by_item_set(purchase_order_item):
    last_purchase_rate_based_on = "Item Set"
    purchased_item_code = purchase_order_item.item_code

    # get items
    doctype = "Item Set"
    filters = {
        "parentfield": "item_set",
        "parenttype": "List of Material",
        "item": purchased_item_code,
    }

    fieldname = "list_of_material_detail"

    list_of_material_details = \
        frappe.get_list(doctype, filters,
                        fieldname, as_list=True)

    for list_of_material_detail, in list_of_material_details:
        update_list_of_material_detail(list_of_material_detail,
                                       purchase_order_item,
                                       last_purchase_rate_based_on)


def update_list_of_material_detail(list_of_material_detail,
                                   purchase_order_item,
                                   last_purchase_rate_based_on):
    doctype = "List of Material Detail"
    name = list_of_material_detail

    list_of_material_detail_doc = \
        frappe.get_doc(doctype, name)

    list_of_material_detail_doc \
        .update({
            "last_purchase_item": purchase_order_item.item_code,
            "last_purchase_rate": purchase_order_item.base_rate,
            "last_purchase_uom": purchase_order_item.uom,
        })

    if list_of_material_detail_doc.last_purchase_rate_based_on \
            != last_purchase_rate_based_on:
        return None

    list_of_material_detail_doc \
        .db_update()

    return list_of_material_detail_doc
