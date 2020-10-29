# -*- coding: utf-8 -*-
# Copyright (c) 2019, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe import db as database


@frappe.whitelist()
def get_all_series():
    return database.sql("""
		Select
			parent as doctype,
			options as serie 
		From 
			`tabDocField` 
			Where
				fieldname = "naming_series"
	""", as_dict=True)
