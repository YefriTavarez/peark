# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

from frappe import _ as translate
from frappe import _dict as pydic
from frappe import db as database

from frappe.model.document import Document


class Dimension(Document):
    def autoname(self):
        self.set_new_name()

    def set_new_name(self):
        new_name = self.generate_autoname()

        self.name = new_name

    def validate(self):
        self.validate_if_exists()

    def validate_if_exists(self):
        doctype = self.doctype
        name = self.generate_autoname()

        url_to_form = frappe.utils.get_url_to_form(doctype, name)

        error_message = """
            Se encontró una {doctype} en el sistema que coincide 
            con estos valores: <br>
            <a href="{url_to_form}"><strong>{doctype}</strong>: {name}</a>
        """

        if not database.exists(doctype, name):
            return

        if not self.is_new() and self.name == name:
            return

        frappe.throw(
            error_message
            .format(doctype=doctype,
                    url_to_form=url_to_form,
                    name=name)
        )

    def generate_autoname(self):
        return "{width} {width_uom} x {height} {height_uom}" \
            .format(width=self.width,
                    width_uom=self.width_uom,
                    height=self.height,
                    height_uom=self.height_uom)

    disabled = False
    height = 0
    height_uom = None
    width = 0
    width_uom = None
