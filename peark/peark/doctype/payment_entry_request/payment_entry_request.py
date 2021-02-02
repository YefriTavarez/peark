# -*- coding: utf-8 -*-
# Copyright (c) 2021, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

from frappe import scrub
from frappe import _ as translate

from frappe.model.document import Document


class PaymentEntryRequest(Document):
    def validate(self):
        self.validate_party_type()
        self.validate_amount()
        self.set_party_name_if_missing()

    def set_party_name_if_missing(self):
        if not self.party_name:
            self.set_party_name()

    def set_party_name(self):
        self.validate_party_type()

        fieldname = "{0}_name" \
            .format(scrub(self.party_type))

        if self.party_type == "Shareholder":
            fieldname = "title"

        party_name = frappe \
            .get_value(self.party_type, self.party, fieldname)

        self.party_name = party_name

    def validate_party_type(self):
        valid_parties = (
            "Supplier",
            "Employee",
            "Customer",
            "Shareholder",
        )

        self.validate_value("party_type", "in", valid_parties)

    def validate_amount(self):
        self.validate_value("amount", ">", .0)

    posting_date = None
    due_date = None
    naming_series = None
    status = None
    system_status = None
    party_type = None
    party = None
    party_name = None
    owner = None
    amount = None
    currency = None
    reason = None
