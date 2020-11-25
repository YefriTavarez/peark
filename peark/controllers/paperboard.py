# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

import frappe

from frappe import db as database

from peark.controllers.erpnext.item import get_item_doc
from peark.controllers.erpnext.item import set_naming_series

from peark.controllers.erpnext.item_group import get_item_group_root


def on_update(doc, method):
    create_item_based_on_paperboard(doc)


def create_item_based_on_paperboard(doc):
    stock_uom = database \
        .get_single_value("Stock Settings", "stock_uom")

    item_groups = [
        "item_group_0",
        "item_group_1",
        "item_group_2",
        "item_group_3",
        "item_group_4",
        "item_group_5",
    ]

    root_item_group = get_item_group_root()
    item_group_count = len(doc.item_groups)

    # join both as one
    weight_and_calipers = list()

    for weight in doc.weights:
        if doc.include_uom_in_title:
            weight_and_calipers.append(weight.paperboard_weight)
        else:
            weight_and_calipers.append(weight.weight)

    for caliper in doc.calipers:
        if doc.include_uom_in_title:
            weight_and_calipers.append(caliper.paperboard_caliper)
        else:
            weight_and_calipers.append(caliper.caliper)

    for child in doc.dimensions:
        for weight_or_caliper in weight_and_calipers:
            # item_doc = get_item_doc(
            #     doc.doctype, doc.name, child.doctype, child.name)

            items_specs = get_item_specs(doc, child, weight_or_caliper)

            doctype = "Item"
            filters = {
                "description": items_specs,
            }

            if database.exists(doctype, filters):
                continue

            item_doc = frappe.new_doc(doctype)

            # convert item group list to item group fields
            for idx, fieldname in enumerate(item_groups):
                if idx >= item_group_count:
                    item_doc.set(fieldname, None)
                    continue

                row = doc.item_groups[idx]
                item_group = row.item_group

                if item_group == root_item_group:
                    continue

                item_doc.set(fieldname, item_group)

            item_doc.update({
                "item_name": doc.material_name,
                "item_group": doc.get_item_group(),
                "stock_uom": stock_uom,
                "disabled": 0,
                "allow_alternative_item": False,
                "is_stock_item": True,
                "include_item_in_manufacturing": False,
                "opening_stock": 0,
                "valuation_rate": 0,
                "standard_rate": 0,
                "is_fixed_asset": False,
                "auto_create_assets": False,
                "asset_category": None,
                "asset_naming_series": None,
                "over_delivery_receipt_allowance": 100,
                "over_billing_allowance": 100,
                "description": items_specs,
                "default_material_request_type": "Purchase",
                "valuation_method": "FIFO",
                "has_batch_no": True,
                "create_new_batch": True,
                "batch_number_series": "COMP-MAT-IMP.#####",
                "has_expiry_date": False,
                "retain_sample": False,
                "sample_quantity": 0,
                "has_serial_no": False,
                "serial_no_series": None,
                "has_variants": False,
                "variant_based_on": "Item Attribute",
                "is_purchase_item": True,
                "purchase_uom": stock_uom,
                "min_order_qty": 0,
                "safety_stock": 0,
                "lead_time_days": 0,
                "last_purchase_rate": 0,
                "sales_uom": stock_uom,
                "is_sales_item": False,
                "ref_doctype": doc.doctype,
                "ref_docname": doc.name,
                "ref_childtype": child.doctype,
                "ref_childname": child.name,
            })

            item_doc.flags.ignore_mandatory = True

            item_doc.save(ignore_permissions=True)


def get_item_specs(doc, child, weight_or_caliper):
    dimension = child.dimension
    full_name = doc.get_full_name(weight_or_caliper)

    return " ".join((full_name, dimension))
