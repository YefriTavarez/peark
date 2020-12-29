# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document


class ProductionProjectCenters(Document):
    project_center = None
    product_name = None
    item = None
    item_specs = None
    qty = .000
    warehouse = None
