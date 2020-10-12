# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe.utils import flt


class VariableCostEstimate(Document):
    def update_amount(self, qty_to_produce):
        amount = flt(self.qty) * flt(qty_to_produce) * flt(self.rate)

        # update self
        self.amount = amount

    cost_specification = None
    rate = .000
    qty = .000
    amount = .000
