# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.mapper import get_mapped_doc
from frappe.utils import flt, nowdate, getdate
from frappe import _ as translate
from frappe import db as database

from erpnext.stock.get_item_details import get_item_details


@frappe.whitelist()
def make_sales_quotation(source_name, target_doc=None):
    cost_estimation = database.get_value("Cost Estimation", source_name, [
        "generated_on", "valid_until"], as_dict=1)
    if cost_estimation.valid_until and (cost_estimation.valid_until < cost_estimation.generated_on or cost_estimation.valid_until < getdate(nowdate())):
        frappe.throw(_("Validity period of this quotation has ended."))
    return _make_sales_quotation(source_name, target_doc)


def _make_sales_quotation(source_name, target_doc=None, ignore_permissions=False):
    defaults = frappe.defaults.get_defaults()
    source_doctype = "Cost Estimation"
    source_doc = frappe.get_doc(source_doctype, source_name)

    if not target_doc:
        target_doctype = "Quotation"
        target_doc = frappe.new_doc(target_doctype)

    def get_item(source_doc):
        ref_doctype = "Product Assembly"
        ref_docname = source_doc.product_assembly

        doctype = "Item"
        filters = {
            "ref_doctype": ref_doctype,
            "ref_docname": ref_docname,
        }

        errmsg = translate("Item not found for Product Assembly: {}")
        if not database.exists(doctype, filters):
            frappe.throw(errmsg.format(ref_docname))

        item_doc = frappe.get_doc(doctype, filters)


        args = {
            "item_code": item_doc.name,
            "item_name": item_doc.item_name,
            "parent": target_doc.name,
            "parentfield": "items",
            "parenttype": "Quotation",
            "description": source_doc.product_assembly_specification,
            "company": defaults.company,
            "doctype": "Quotation",
            "currency": source_doc.currency,
            "qty": source_doc.qty_to_produce,
            "rate": source_doc.rate_per_unit,
        }

        return get_item_details(args)

    def set_missing_values(source, target):
        if source_doc.customer:
            target.quotation_to = "Customer"
            target.party_name = source_doc.customer
            target.customer_name = source_doc.customer

        target.ignore_pricing_rule = 1
        target.flags.ignore_permissions = ignore_permissions

        target.run_method("set_missing_values")
        target.run_method("calculate_taxes_and_totals")

        item = target.append("items", {})

        item.doctype = "Quotation Item"

        item.update(get_item(source))
        item.rate = flt(source_doc.rate_per_unit)

    def update_item(obj, target, source_parent):
        target.stock_qty = flt(obj.qty) * flt(obj.conversion_factor)

    doclist = get_mapped_doc(source_doctype, source_name, {
        source_doctype: {
            "doctype": "Sales Order",
            # "validation": {
            #     "docstatus": ["=", 1]
            # }
        },
    }, target_doc, set_missing_values, ignore_permissions=ignore_permissions)

    # postprocess: fetch shipping address, set missing values

    target_doc.save(ignore_permissions=True)

    return target_doc
