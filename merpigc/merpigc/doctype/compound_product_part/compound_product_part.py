# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document


class CompoundProductPart(Document):
    def get_product_assembly(self):
        doctype = self.meta.get_field("product_assembly") \
            .options

        name = self.product_assembly

        doc = frappe.get_doc(doctype, name)

        return doc

    product_assembly = None
    part_name = None
    product_specification = None
    qty = 1
