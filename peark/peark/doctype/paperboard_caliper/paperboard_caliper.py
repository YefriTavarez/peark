# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document


class PaperboardCaliper(Document):
    def autoname(self):
        self.set_name()

    def set_name(self):
        name = "{} {}" \
            .format(self.caliper, self.capliper_uom)

        self.name = name

    caliper = None
    capliper_uom = None
