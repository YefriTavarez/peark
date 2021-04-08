# -*- coding: utf-8 -*-
# Copyright (c) 2021, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

from frappe.model.document import Document
from frappe.model.naming import make_autoname

from pdf2image import convert_from_path


class DieCutStocking(Document):
    def autoname(self):
        self.name = self.get_new_name()

    def validate(self):
        self.generate_jpgs()

    def generate_jpgs(self):
        fieldlist = (
            ("standalone_product", "standalone_product_image"),
            ("mounted_product", "mounted_product_image"),
        )

        for source_field, target_field in fieldlist:
            self.generate_jpg(source_field, target_field)

    def generate_jpg(self, source_field, target_field):
        site_path = frappe.utils.get_path()
        # files_path = frappe.utils.get_files_path()

        source_pdf = self.get(source_field)

        if not source_pdf or not source_pdf.endswith(".pdf"):
            # ignore, put placeholder instead
            placeholder_path = "/files/placeholder-pdf.png"

            self.set(target_field, placeholder_path)

            return False

        images = convert_from_path("".join([site_path, source_pdf]))

        target_jpg = source_pdf.replace(".pdf", ".jpg")

        for img in images:
            image_type = "JPEG"

            # we make it public to be able to access from
            # the web without any restrictions
            public_target = target_jpg.replace(
                "/private/files", "/public/files")

            path = "".join([site_path, public_target])

            img.save(path, image_type)

            self.set(target_field, public_target.replace(
                "/public", ""))

    def get_new_name(self):
        customer = self.customer

        first_letter = customer[0]

        series = "{0}-.####".format(first_letter)
        return make_autoname(series)

    customer = ""
    product_name = None
    width = .000
    height = .000
    depth = .000
    product_profile = None
    standalone_product = None
    standalone_product_image = None
    mounted_product = None
    mounted_product_image = None
