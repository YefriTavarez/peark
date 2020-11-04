# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe.utils import flt


class InkUsageDetail(Document):
    def set_ink_usage(self, width, height, sheets):
        self.ink_usage = self.get_ink_usage(width, height, sheets)

    def get_ink_usage(self, width, height, sheets):
        return flt(self.material_ink_usage) \
            * flt(self.ink_coverage) \
            * flt(self.print_pattern) \
            * flt(width) \
            * flt(height) \
            * flt(sheets)

    def set_ink_amount(self, width, height, sheets):
        self.set_ink_usage(width, height, sheets)
        self.ink_amount = self.get_ink_amount()

    def get_ink_amount(self):
        return flt(self.ink_rate) \
            * flt(self.ink_usage)

    material_ink_usage = 0
    ink_coverage = 0
    print_pattern = 0
    ink_usage = 0
    ink_rate = 0
    ink_amount = 0
    remarks = None
