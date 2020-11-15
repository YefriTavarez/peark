# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe.utils import cstr
from frappe.model.naming import make_autoname


class ListofMaterialDetail(Document):
    def autoname(self):
        self.set_name()

    def set_name(self):
        naming_selection = "Naming Series"
        naming_series = "LIST-OF-MATERIAL-DETAIL-"

        if not self.naming_selection:
            self.naming_selection = naming_selection

        newname = None
        if self.naming_selection == naming_selection:
            if not self.naming_series:
                self.naming_series = naming_series

            newname = make_autoname(self.naming_series)

        if self.naming_selection == "Supply Specs":
            newname = cstr(self.supply_specs)

        if not newname:
            newname = make_autoname(naming_series)

        self.name = newname

    supply_specs = None
    override_item_name = False
    naming_selection = None
    naming_series = None
    qty = 0
    fixed_qty = False
    uom = None
    last_purchase_rate_based_on = None
    item = None
    item_group = None
    item_set_display = None
    last_purchase_item = None
    last_purchase_rate = .000
    last_purchase_uom = None
