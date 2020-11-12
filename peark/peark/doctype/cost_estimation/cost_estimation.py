# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe import _dict as pydict
from frappe import db as database
from frappe import _ as translate

from frappe.utils import today
from frappe.utils import flt, cint, cstr

from . import make_sales_quotation


class CostEstimation(Document):
    def onload(self):
        self.fetch_cost_estimation_type()
        self.fetch_product_assembly()

    def validate(self):
        self.update_status()

        self.validate_product_assembly()
        self.validate_qty_to_produce()

    def on_change(self):
        self.calculate_totals()

        if not self.is_new():
            self.db_update()

    def make_quotation(self):
        return make_sales_quotation(self.name)

    def update_status(self):
        valid_until = cstr(self.valid_until)

        if valid_until >= today():
            self.db_set("status", "Valid")

            return True

        self.db_set("status", "Expired")

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
        doctype = self.meta \
            .get_field("product_assembly") \
            .options

        docname = self.product_assembly

        if docname:
            product_assembly = frappe \
                .get_doc(doctype, docname)

            if not product_assembly.is_compound_product:
                self.set_assembly_onload(product_assembly)
                return [product_assembly]

            doctype = "Compound Product"
            filters = {
                "enabled": True,
                "product_assembly": self.product_assembly,
            }

            errmsg = \
                translate("The Product you're trying to estimate is marked "
                          "as Compound Product, but no Enabled Compound "
                          "Product template was found")

            if not database.exists(doctype, filters):
                frappe.throw(errmsg)

            product_compound = frappe.get_doc(doctype, filters)

            sub_assemblies = [d.get_product_assembly()
                              for d in product_compound.parts]

        self.set_assembly_onload(product_assembly, sub_assemblies)

    def set_assembly_onload(self, product_assembly, sub_assemblies=None):
        is_compound_product = product_assembly.is_compound_product

        errmsg = \
            translate("You've passed a Compound Product as a "
                      "Product Assembly but no Sub Assemblies were passed")

        if is_compound_product and sub_assemblies is None:
            frappe.throw(errmsg)

        options = pydict()
        if is_compound_product:
            assembly_specifications = ", ".join(
                (d.get_full_name() for d in sub_assemblies))

            # assembly_options = ", ".join(
            #     (d.get_product_options() for d in sub_assemblies))

            # group by options
            for sub_assembly in sub_assemblies:
                product_options = sub_assembly.get_product_options()
                for product_option in product_options.split(", "):
                    if not product_option in options:
                        options[product_option] = pydict(
                            qty=0, rate=.000)

                    option = options[product_option]

                    option.qty += 1

            assembly_options = list()
            for key in options.keys():
                newdict = options[key]
                newdict.setdefault("cost_specification", key)

                assembly_options.append(newdict)

        else:
            assembly_specifications = product_assembly \
                .get_full_name()

            # assembly_options = product_assembly \
            #     .get_product_options()

            product_options = product_assembly.get_product_options()
            for product_option in product_options.split(", "):
                if not product_option in options:
                    options[product_option] = pydict(
                        qty=0, rate=.000)

                option = options[product_option]

                option.qty += 1

            assembly_options = list()
            for key in options.keys():
                newdict = options[key]
                newdict.setdefault("cost_specification", key)

                assembly_options.append(newdict)

        final_dimension = product_assembly.dimension

        self.set_onload("product_assembly",
                        product_assembly)

        if is_compound_product:
            self.set_onload("sub_assemblies",
                            sub_assemblies)

        self.set_onload("assembly_specifications",
                        assembly_specifications)

        self.set_onload("assembly_options",
                        assembly_options)

        # # temporary update of product_assembly_specification
        # if not self.product_assembly_specification == assembly_specifications:
        #     self.db_set("product_assembly_specification",
        #                 assembly_specifications, update_modified=False)

        # temporary update of final_dimension
        if not self.final_dimension == final_dimension \
                and not self.is_new():
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
        self.set_margin_amount_1()
        self.set_margin_amount_2()
        self.set_grand_total()
        self.set_rate_per_unit()

    def set_sub_total(self):
        total_costs = self.get_sub_total()

        self.sub_total = total_costs

    def get_sub_total(self):
        total_ink_usage = self.get_total_ink_usage()
        total_fixed_costs = self.get_total_fixed_costs()
        total_variable_costs = self.get_total_variable_costs()

        return total_ink_usage \
            + total_fixed_costs \
            + total_variable_costs

    def set_grand_total(self):
        total_costs = self.get_grand_total()

        self.grand_total = total_costs

    def set_rate_per_unit(self):
        total_costs = flt(self.grand_total)
        qty_to_produce = cint(self.qty_to_produce)

        rate_per_unit = .000

        if total_costs and qty_to_produce:
            rate_per_unit = flt(total_costs / qty_to_produce,
                                self.precision("rate_per_unit"))

        self.rate_per_unit = rate_per_unit

    def get_grand_total(self):
        commission_amount = self.get_commission_amount()
        margin_amount_1 = self.get_margin_amount_1()
        margin_amount_2 = self.get_margin_amount_2()
        sub_total = self.get_sub_total()

        return commission_amount \
            + margin_amount_1 \
            + margin_amount_1 \
            + sub_total

    def set_commission_amount(self):
        commission_amount = self.get_commission_amount()

        self.commission_amount = commission_amount

    def set_margin_amount_1(self):
        margin_amount_1 = self.get_margin_amount_1()

        self.margin_amount_1 = margin_amount_1

    def set_margin_amount_2(self):
        margin_amount_2 = self.get_margin_amount_2()

        self.margin_amount_2 = margin_amount_2

    def get_commission_rate(self):
        return flt(self.commission_rate)

    def get_commission_amount(self):
        commission_amount = .000

        sub_total = flt(self.sub_total)

        if sub_total:
            commission_rate = self.get_commission_rate() / 100.000

            commission_amount = sub_total * commission_rate

        return commission_amount

    def get_margin_rate_1(self):
        return flt(self.margin_rate_1)

    def get_margin_rate_2(self):
        return flt(self.margin_rate_2)

    def get_margin_amount_1(self):
        margin_amount_1 = .000

        sub_total = flt(self.sub_total)

        if sub_total:
            margin_rate_1 = self.get_margin_rate_1() / 100.000

            margin_amount_1 = sub_total * margin_rate_1

        return margin_amount_1

    def get_margin_amount_2(self):
        margin_amount_2 = .000

        sub_total = flt(self.sub_total)

        if sub_total:
            margin_rate_2 = self.get_margin_rate_2() / 100.000

            margin_amount_2 = sub_total * margin_rate_2

        return margin_amount_2

    def get_total_ink_usage(self):
        # self.dimension_for_press
        width = self.dimension_for_press_width * .0254
        height = self.dimension_for_press_height * .0254
        sheets = flt(self.sheets_to_buy)

        for child in self.ink_usage_detail:
            child.set_ink_amount(width, height, sheets)

        return sum(child.ink_amount for child in self.ink_usage_detail)

    def get_total_fixed_costs(self):
        for child in self.fixed_costs:
            child.update_amount()

        variable_costs = [flt(d.amount) for d in self.fixed_costs]

        return sum(variable_costs)

    def get_total_variable_costs(self):
        for child in self.variable_costs:
            child.update_amount(self.sheets_to_buy)

        variable_costs = [flt(d.amount) for d in self.variable_costs]

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
    ink_usage_detail = list()
    fixed_costs = list()
    variable_costs = list()
    sales_person = None
    margin_rate_1 = .000
    margin_amount_1 = .000
    margin_rate_2 = .000
    margin_amount_2 = .000
    commission_rate = .000
    commission_amount = .000
    rate_per_unit = .000
    sub_total = .000
    sheets_to_buy = .000
    grand_total = .000

    dimension_for_press = None
    dimension_for_press_width = 0.000
    dimension_for_press_height = 0.000
