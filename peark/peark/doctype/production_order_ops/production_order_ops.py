# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document


class ProductionOrderOps(Document):
    def on_change(self):
        self.notify_update_idx()

    def on_trash(self):
        self.notify_update_idx()

    def notify_update_idx(self):
        doctype = self.parenttype
        name = self.parent

        doc = frappe.get_doc(doctype, name)

        doc.run_method("update_indexes")

    production_order = None
    product_feature = None
    parent_department = None
    department = None
    work_station = None
    employee = None
    employee_name = None
    additional_information = None

    # std fields
    parenttype = None
    parent = None
