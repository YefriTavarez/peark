# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe import _dict as pydict
from frappe import db as database
from frappe import _ as translate

from frappe.utils import flt, cint


class CostEstimation(Document):
    def onload(self):
        self.fetch_cost_estimation_type()
        self.fetch_product_assembly()

    def validate(self):
        self.validate_product_assembly()
        self.validate_qty_to_produce()

    def on_change(self):
        self.calculate_totals()

    def validate_qty_to_produce(self):
        qty_to_produce = flt(self.qty_to_produce)

        errmsg = translate("Qty to produce must be greater than zero!")

        if qty_to_produce <= 0:
            frappe.throw(errmsg)

    def validate_product_assembly(self):
        doctype = self.meta \
            .get_field("product_assembly") \
            .options

        docname = self.product_assembly
        fieldname = "product_profile"

        value = database.get_value(doctype, docname, fieldname)

        errmsg = translate("Product Assembly: {} is not "
                           "a type of Product Profile: {}")

        if value != self.product_profile:
            formatted_error = errmsg.format(self.product_assembly,
                                            self.product_profile)

            frappe.throw(formatted_error)

    def fetch_product_assembly(self):
        # get_full_name

        doctype = self.meta \
            .get_field("product_assembly") \
            .options

        docname = self.product_assembly

        product_assembly = pydict()

        if docname:
            product_assembly = frappe \
                .get_doc(doctype, docname)

            self.set_assembly_onload(product_assembly)

    def set_assembly_onload(self, product_assembly):
        assembly_specifications = product_assembly \
            .get_full_name()

        assembly_options = product_assembly \
            .get_product_options()

        final_dimension = product_assembly.dimension

        self.set_onload("product_assembly",
                        product_assembly)

        self.set_onload("assembly_specifications",
                        assembly_specifications)

        self.set_onload("assembly_options",
                        assembly_options)

        # temporary update of product_assembly_specification
        if not self.product_assembly_specification == assembly_specifications:
            self.db_set("product_assembly_specification",
                        assembly_specifications, update_modified=False)

        # temporary update of final_dimension
        if not self.final_dimension == final_dimension:
            self.db_set("final_dimension",
                        final_dimension, update_modified=False)

    def fetch_cost_estimation_type(self):
        doctype = self.meta \
            .get_field("cost_estimation_type") \
            .options

        docname = self.cost_estimation_type

        cost_estimation_type = pydict()

        if docname:
            cost_estimation_type = frappe \
                .get_doc(doctype, docname)

        self.set_onload("cost_estimation_type",
                        cost_estimation_type)

    def calculate_totals(self):
        self.set_sub_total()
        self.set_commission_amount()
        self.set_grand_total()
        self.set_rate_per_unit()

    def set_sub_total(self):
        total_costs = self.get_sub_total()

        self.sub_total = total_costs

    def get_sub_total(self):
        total_fixed_costs = self.get_total_fixed_costs()
        total_variable_costs = self.get_total_variable_costs()

        return total_fixed_costs + total_variable_costs

    def set_grand_total(self):
        total_costs = self.get_grand_total()

        self.grand_total = total_costs

    def set_rate_per_unit(self):
        total_costs = flt(self.grand_total)
        qty_to_produce = cint(self.qty_to_produce)

        rate_per_unit = .000

        if total_costs:
            rate_per_unit = flt(total_costs / qty_to_produce,
                                self.precision("rate_per_unit"))

        self.rate_per_unit = rate_per_unit

    def get_grand_total(self):
        commission_amount = self.get_commission_amount()
        sub_total = self.get_sub_total()

        return commission_amount + sub_total

    def set_commission_amount(self):
        commission_amount = self.get_commission_amount()

        self.commission_amount = commission_amount

    def get_commission_rate(self):
        return flt(self.commission_rate)

    def get_commission_amount(self):
        commission_amount = .000

        sub_total = flt(self.sub_total)

        if sub_total:
            commission_rate = self.get_commission_rate() / 100.000

            commission_amount = sub_total * commission_rate

        return commission_amount

    def get_total_fixed_costs(self):
        fixed_costs = [d.rate for d in self.fixed_costs]

        return sum(fixed_costs)

    def get_total_variable_costs(self):
        for child in self.variable_costs:
            child.update_amount(self.qty_to_produce)

        variable_costs = [d.rate for d in self.variable_costs]

        return sum(variable_costs)

    customer = None
    cost_estimation_type = None
    status = None
    generated_on = None
    valid_until = None
    currency = None
    product_profile = None
    product_assembly = None
    product_assembly_specification = None
    qty_to_produce = 0
    units_per_sheet = 0
    supplier_dimension = None
    sheet_dimension = None
    final_dimension = None
    fixed_costs = list()
    variable_costs = list()
    sales_person = None
    commission_rate = .000
    commission_amount = .000
    rate_per_unit = .000
    sub_total = .000
    grand_total = .000
