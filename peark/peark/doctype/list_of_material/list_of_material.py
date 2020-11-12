# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe.utils import cstr, cint
from frappe.model.naming import make_autoname

class ListofMaterial(Document):
    def autoname(self):
        self.set_name()
    
    def set_name(self):
        newname = None
        naming_series  = "LIST-OF-MAT-"

        if self.naming_selection == "Naming Series":
            if not self.naming_series:
                self.naming_series  = naming_series

            newname = make_autoname(self.naming_series)

        if self.naming_selection == "List of Material Name":
            newname = self.list_of_material_name

        if not newname:
            newname = make_autoname(naming_series)

        self.name = newname

    list_of_material_name = None
    naming_selection = None
    naming_series = None
    items = list()
    item_set = list()
