# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe.utils import cstr

from frappe import _ as translate
from frappe.model.naming import make_autoname


class ListofMaterialDetail(Document):
    def autoname(self):
        self.set_name()

    def validate(self):
        self.validate_item_uom()

    def validate_item_uom(self):
        def _validate_item_uom():
            doctype = "Item"
            name = self.item

            doc = frappe.get_doc(doctype, name)

            if self.uom in [d.uom for d in doc.uoms]:
                return True

            errmsg = \
                translate("Conversion Factor not specified "
                          "in UOMs table in {0}: {1} for UOM: {2}")

            frappe.throw(
                errmsg
                .format(doc.item_code,
                        doc.item_name, self.uom)
            )

        def _validate_item_group_uom():
            doctype = "Item"
            filters = {
                "disabled": 0,
                "is_stock_item": 1,
                "item_group": self.item_group,
            }

            doclist = frappe \
                .get_all(doctype,
                         filters,
                         as_list=True)

            for name, in doclist:
                doc = frappe.get_doc(doctype, name)

                if self.uom in [d.uom for d in doc.uoms]:
                    continue

                errmsg = \
                    translate("Conversion Factor not specified "
                              "in UOMs table in {0}: {1} for UOM: {2}")

                frappe.throw(
                    errmsg
                    .format(doc.item_code,
                            doc.item_name, self.uom)
                )

        def _validate_item_set_uom():
            doctype = "Item Set"
            filters = {
                "parenttype": "List of Material Detail",
                "parentfield": "item_set",
                "parent": self.name,
            }

            fields = "item"

            doclist = frappe \
                .get_all(doctype,
                         filters,
                         fields,
                         as_list=True)

            for name, in doclist:
                doctype = "Item"
                doc = frappe.get_doc(doctype, name)

                if self.uom in [d.uom for d in doc.uoms]:
                    continue

                errmsg = \
                    translate("Conversion Factor not specified "
                              "in UOMs table in {0}: {1} for UOM: {2}")

                frappe.throw(
                    errmsg
                    .format(doc.item_code,
                            doc.item_name, self.uom)
                )

        if self.last_purchase_rate_based_on == "Item":
            _validate_item_uom()

        if self.last_purchase_rate_based_on == "Item Group":
            _validate_item_group_uom()

        if self.last_purchase_rate_based_on == "Item Set":
            _validate_item_set_uom()

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
