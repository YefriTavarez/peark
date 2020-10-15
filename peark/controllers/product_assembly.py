# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

import frappe

from frappe import db as database

from peark.controllers.erpnext.item import get_item_doc
from peark.controllers.erpnext.item import set_naming_series


def on_update(doc, method):
    create_item_based_on_product_assembly(doc)


def create_item_based_on_product_assembly(doc):
    stock_uom = database \
        .get_single_value("Stock Settings", "stock_uom")

    item_doc = get_item_doc(
        doc.doctype, doc.name)

    item_doc.update({
        "item_name": doc.product_profile,
        "item_group_1": doc.item_group_1,
        "item_group_2": doc.item_group_2,
        "item_group_3": doc.item_group_3,
        "item_group_4": doc.item_group_4,
        "item_group": doc.get_item_group(),
        "stock_uom": stock_uom,
        "disabled": 0,
        "allow_alternative_item": False,
        "is_stock_item": doc.keep_stock,
        "include_item_in_manufacturing": True,
        "opening_stock": 0,
        "valuation_rate": 0,
        "standard_rate": 0,
        "is_fixed_asset": False,
        "auto_create_assets": False,
        "asset_category": None,
        "asset_naming_series": None,
        "over_delivery_receipt_allowance": 100,
        "over_billing_allowance": 100,
        # "description": get_compact_title(doc, item_doc, as_html=True),
        # "description": get_item_name(doc),
        "description": doc.full_specifications,
        "default_material_request_type": "Manufacture",
        "valuation_method": "FIFO",
        "has_batch_no": True,
        "create_new_batch": True,
        "batch_number_series": "{0}-.#####".format(doc.name),
        "has_expiry_date": False,
        "retain_sample": False,
        "sample_quantity": 0,
        "has_serial_no": False,
        "serial_no_series": None,
        "has_variants": False,
        "variant_based_on": "Item Attribute",
        "is_purchase_item": False,
        "purchase_uom": stock_uom,
        "min_order_qty": 0,
        "safety_stock": 0,
        "lead_time_days": 0,
        "last_purchase_rate": 0,
        "sales_uom": stock_uom,
        "is_sales_item": True,
        "ref_doctype": doc.doctype,
        "ref_docname": doc.name,
        # "ref_childtype": child.doctype,
        # "ref_childname": child.name,
    })

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
