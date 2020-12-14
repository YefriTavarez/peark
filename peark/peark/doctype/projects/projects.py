# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe import get_doc


class Projects(Document):
    def get_project_doc(self):
        doctype = self.meta.get_field("project") \
            .options

        name = self.project

        return get_doc(doctype, name)

    def update_missing_values(self):
        doc = self.get_project_doc()

        self.project_template = doc.project_template
        self.status = doc.status
        self.save(ignore_permissions=True)

    project = None
    project_template = None
    department = None
    status = None
