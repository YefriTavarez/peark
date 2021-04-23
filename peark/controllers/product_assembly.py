# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

import frappe

from frappe import db as database

from peark.controllers.erpnext.item import get_item_doc
from peark.controllers.erpnext.item import set_naming_series

from peark.controllers.erpnext.item_group import get_item_group_root


def on_update(doc, method):
    create_item_based_on_product_assembly(doc)


def create_item_based_on_product_assembly(doc):
    stock_uom = database \
        .get_single_value("Stock Settings", "stock_uom")

    fieldlist = [
        "item_group_0",
        "item_group_1",
        "item_group_2",
        "item_group_3",
        "item_group_4",
        "item_group_5",
    ]

    root_item_group = get_item_group_root()
    item_group_count = len(doc.item_groups)

    item_doc = get_item_doc(
        doc.doctype, doc.name)

    for idx, fieldname in enumerate(fieldlist):
        if idx >= item_group_count:
            item_doc.set(fieldname, None)
            continue

        row = doc.item_groups[idx]
        item_group = row.item_group

        if item_group == root_item_group:
            continue

        item_doc.set(fieldname, item_group)

    item_doc.update({
        "item_name": doc.product_profile,
        "item_group": doc.get_item_group(),
        "stock_uom": stock_uom,
        "disabled": 0,
        "allow_alternative_item": 0,
        "is_stock_item": doc.keep_stock,
        "include_item_in_manufacturing": 1,
        "opening_stock": 0,
        "valuation_rate": 0,
        "standard_rate": 0,
        "is_fixed_asset": 0,
        "auto_create_assets": 0,
        "asset_category": None,
        "asset_naming_series": None,
        "over_delivery_receipt_allowance": 100,
        "over_billing_allowance": 100,
        "description": doc.get_full_specifications(dont_generate=True),
        "default_material_request_type": "Manufacture",
        "valuation_method": "FIFO",
        "has_batch_no": doc.keep_stock,
        "create_new_batch": doc.keep_stock,
        "batch_number_series": "{0}-.#####".format(doc.name),
        "has_expiry_date": 0,
        "retain_sample": 0,
        "sample_quantity": 0,
        "has_serial_no": 0,
        "serial_no_series": None,
        "has_variants": 0,
        "variant_based_on": "Item Attribute",
        "is_purchase_item": 0,
        "purchase_uom": stock_uom,
        "min_order_qty": 0,
        "safety_stock": 0,
        "lead_time_days": 0,
        "last_purchase_rate": 0,
        "sales_uom": stock_uom,
        "is_sales_item": 1,
        "ref_doctype": doc.doctype,
        "ref_docname": doc.name,
    })

    item_doc.flags.ignore_mandatory = True

    item_doc.save(ignore_permissions=True)


def get_compact_title(doc, item_doc, as_html=False):

    if item_doc.is_new():
        return None

    item_code = item_doc.item_code
    item_name = get_item_name(doc)

    compact_title = " - ".join((item_code, item_name))

    if as_html:
        compact_title = """<strong>{item_code}<strong>
            <br>{item_name}
        """.format(item_code=item_code, item_name=item_name)

    return compact_title


def get_item_name(doc):
    full_name = doc.get_full_name()

    return full_name
