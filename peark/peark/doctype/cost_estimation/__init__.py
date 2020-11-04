# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.mapper import get_mapped_doc
from frappe.utils import flt, nowdate, getdate
from frappe import _

from erpnext.stock.get_item_details import get_item_details

@frappe.whitelist()
def make_sales_quotation(source_name, target_doc=None):
	cost_estimation = frappe.db.get_value("Cost Estimation", source_name, ["generated_on", "valid_till"], as_dict = 1)
	if cost_estimation.valid_till and (cost_estimation.valid_till < cost_estimation.generated_on or cost_estimation.valid_till < getdate(nowdate())):
		frappe.throw(_("Validity period of this quotation has ended."))
	return _make_sales_quotation(source_name, target_doc)

def _make_sales_quotation(source_name, target_doc=None, ignore_permissions=False):
	source_doctype = "Cost Estimation"
	source_doc = frappe.get_doc(source_doctype, source_name)

	if not target_doc:
		target_doctype = "Quotation"
		target_doc = frappe.new_doc(target_doctype)

	def get_item(source_doc):
		source_doc.product_assembly

		frappe.get_doc("Item", )
		args = {

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

		
	def update_item(obj, target, source_parent):
		target.stock_qty = flt(obj.qty) * flt(obj.conversion_factor)

	doclist = get_mapped_doc(source_doctype, source_name, {
			source_doctype: {
				"doctype": "Sales Order",
				"validation": {
					"docstatus": ["=", 1]
				}
			},
			# "Quotation Item": {
			# 	"doctype": "Quotation Item",
			# 	"field_map": {
			# 		"parent": "prevdoc_docname"
			# 	},
			# 	"postprocess": update_item
			# },
			# "Sales Taxes and Charges": {
			# 	"doctype": "Sales Taxes and Charges",
			# 	"add_if_empty": True
			# },
			# "Sales Team": {
			# 	"doctype": "Sales Team",
			# 	"add_if_empty": True
			# },
			# "Payment Schedule": {
			# 	"doctype": "Payment Schedule",
			# 	"add_if_empty": True
			# }
		}, target_doc, set_missing_values, ignore_permissions=ignore_permissions)

	# postprocess: fetch shipping address, set missing values

	return doclist