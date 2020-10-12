# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe.utils import cint, flt, cstr

from frappe.email.doctype.notification.notification import get_context

class LabelGenerator(Document):
	def before_print(self):
		context = get_context(self)

		self.add_left_fields(context)
		self.add_right_fields(context)

		display_printing_content = frappe.render_template(self.printing_content, context)

		# frappe.errprint(display_printing_content)

		# append css heading
		heading = "<style>{styling}</style>".format(styling=self.styling)
		display_printing_content = "{}\n{}".format(heading, display_printing_content)

		self.display_printing_content = display_printing_content

	def add_left_fields(self, context):
		column = "left_fields"

		self.add_fields(column, context)

	def add_right_fields(self, context):
		column = "right_fields"

		self.add_fields(column, context)

	def add_fields(self, column, context):
		fieldsdict = list()

		df = {
			"fieldtype": "Float",
		}

		for d in self.get(column):

			if d.fieldtype == "Autoincrement":
				d.value = cint(d.value) + 1

			if d.fieldtype == "Int":
				d.value = frappe.format_value(cint(d.value), df)
			
			if d.fieldtype == "Float":
				d.value = frappe.format_value(flt(d.value, 2), df)

			fieldsdict.append(d)

		context[column] = fieldsdict