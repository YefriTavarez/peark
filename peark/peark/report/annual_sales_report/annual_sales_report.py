# Copyright (c) 2021, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe import db as database
from frappe import _ as translate

def execute(filters=None):
    return AnnualSalesReport \
        .run(filters)

class AnnualSalesReport:
    @classmethod
    def run(cls, filters):
        return cls.get_columns(filters), \
            cls.get_data(filters)

    @classmethod
    def get_columns(cls, filters):
        columns = list()

        customer_column = cls.get_formatted_field("Customer", "Link", "Customer", length=350)
        tax_id_column = cls.get_formatted_field("R. N. C.")
        mes_column = cls.get_formatted_field("Mes")

        base_total_column = cls.get_formatted_field("Total", fieldtype="Currency")
        base_net_total_column = cls.get_formatted_field("Net Total", fieldtype="Currency")
        base_total_taxes_and_charges_column = cls.get_formatted_field("Taxes", fieldtype="Currency")
        base_discount_amount_column = cls.get_formatted_field("Discount", fieldtype="Currency")
        base_grand_total_column = cls.get_formatted_field("Total", fieldtype="Currency")

        columns.append(customer_column)
        columns.append(tax_id_column)

        if filters.get("group_by_month"):
            columns.append(mes_column)
            
        columns.append(base_total_column)
        columns.append(base_net_total_column)
        columns.append(base_total_taxes_and_charges_column)
        columns.append(base_discount_amount_column)
        columns.append(base_grand_total_column)

        return columns

    @classmethod
    def get_data(cls, filters):
        result = cls.get_result_set(filters, 
            cls.get_conditions(filters),
            cls.get_grouping(filters))

        for d in result:
            if not filters.get("group_by_month"):
                continue

            d[2] = cls.translate_month(d[2])

        return result

    @classmethod
    def get_result_set(cls, filters, conditions, group_by):
        fields = cls.get_fields(filters)

        kwargs = {
            "fields": fields,
            "conditions": conditions,
            "group_by": group_by,
        }

        return database.sql("""
            Select
                {fields}
            From
                `tabSales Invoice`
            Where
                {conditions}
            Group By
                {group_by}
            Order By
                customer Asc,
                Month(posting_date) Asc
            """.format(**kwargs), 
        filters, as_list=True)

    @classmethod
    def get_fields(cls, filters):
        fields = list()

        fields.append("customer")
        fields.append("tax_id")

        if filters.get("group_by_month"):
            fields.append("MonthName(posting_date) As posting_date")

        fields.append("Sum(base_total) As base_total")
        fields.append("Sum(base_net_total) As base_net_total")
        fields.append("Sum(base_total_taxes_and_charges) As base_total_taxes_and_charges")
        fields.append("Sum(base_discount_amount) As base_discount_amount")
        fields.append("Sum(base_grand_total) As base_grand_total")

        return ",".join(fields)

    @classmethod
    def get_conditions(cls, filters):
        conditions = list()

        conditions.append("docstatus = 1")

        if "year" in filters:
            conditions.append("Year(posting_date) = %(year)s")

        if "customer_group" in filters:
            conditions.append("customer_group = %(customer_group)s")

        if "account" in filters:
            conditions.append("debit_to = %(account)s")

        return " And ".join(conditions)

    @classmethod
    def get_grouping(cls, filters):
        group_by = list()

        group_by.append("tax_id")

        if filters.get("group_by_month"):
            group_by.append("Month(posting_date)")

        return ",".join(group_by)

    @classmethod
    def translate_month(cls, month):
        return {
            "January": "Enero",
            "February": "Febrero",
            "March": "Marzo",
            "April": "Abril",
            "May": "Mayo",
            "June": "Junio",
            "July": "Julio",
            "August": "Agosto",
            "September": "Septiembre",
            "October": "Octobre",
            "November": "Noviembre",
            "December": "Diciembre",
        }[month]

    @staticmethod
    def get_formatted_field(label, fieldtype="Data", options=str(), length=120):
        kwargs = {
            "label": translate(label),
            "fieldtype": fieldtype,
            "options": options,
            "length": length,
        }

        return "{label}:{fieldtype}/{options}:{length}" \
            .format(**kwargs)
