# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

from frappe import _dict as pydict
from frappe.model.document import Document


class CompoundProduct(Document):
    def onload(self):
        pass

    def on_change(self):
        pass

    def validate(self):
        self.update_product_assembly_specs()
        self.udpdate_product_assembly_specs()

    def udpdate_product_assembly_specs(self):
        product_assembly = self.get_product_assembly()

        product_assembly.full_specifications \
            = self.product_specifications

        product_assembly.flags.dont_update_full_specifications = True

        product_assembly \
            .save(ignore_permissions=True)

    def get_product_assembly(self):
        doctype = self.meta.get_field("product_assembly") \
            .options

        name = self.product_assembly

        doc = frappe.get_doc(doctype, name)

        return doc

    def update_product_assembly_specs(self):
        template = "templates/product_specifications_template.html"

        specs = list()

        for part in self.parts:
            spec = pydict()

            if part.part_name:
                spec.part_name = part.part_name

            spec.qty = part.qty
            spec.description = part.product_specification

            specs.append(spec)

        opts = {
            "product_profile": self.product_profile,
            "specs": specs,
        }

        product_specifications = frappe.render_template(template, opts)

        self.product_specifications = product_specifications

    product_profile = None
    product_assembly = None
    enabled = True
    product_specifications = None
    parts = list()
