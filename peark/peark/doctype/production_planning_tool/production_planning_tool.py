# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe import get_all
from frappe import _dict as pydict
from frappe import _ as translate
from frappe import db as database

from frappe.utils import today, cstr


class ProductionPlanningTool(Document):
    def validate(self):
        pass

    def on_change(self):
        pass

    def make_material_requests(self):
        from erpnext.stock.get_item_details import get_item_details

        def get_grouped_by_request_type():
            material_groups = pydict()
            for material in self.planning_materials:
                if not material_groups.get(material.request_type):
                    material_groups[material.request_type] = list()

                material_groups.get(material.request_type) \
                    .append(material)

            return material_groups

        # args = {
        #     "item_code": "015900000001",
        #     "doctype": "Material Request",
        #     "buying_price_list": "Compra estándar",
        #     "currency": "DOP",
        #     "name": self,
        #     "qty": 1,
        #     "company": self.company,
        #     "conversion_rate": 1,
        #     "material_request_type": "Purchase",
        #     "plc_conversion_rate": 1,
        #     "rate": 0
        # }

        doclist = list()

        doctype = "Material Request"
        material_groups = get_grouped_by_request_type()
        for request_type in material_groups.keys():
            doc = frappe.new_doc(doctype)

            doc.update({
                "company": self.company,
                "production_planning_tool": self.name,
                "material_request_type": request_type,
                "transaction_date": today(),
            })

            def get_schedule_date(newdate):
                newdate = cstr(newdate)
                nowdate = today()

                if nowdate > newdate:
                    return nowdate

                return newdate

            def update_parent_date(newdate):
                newdate = cstr(newdate)
                olddate = cstr(doc.schedule_date)

                newdate = get_schedule_date(newdate)

                if newdate > olddate:
                    doc.schedule_date = newdate

            for material in material_groups[request_type]:

                args = {
                    "item_code": material.item,
                    "company": self.company,
                    "doctype": "Material Request",
                    "qty": material.qty,
                }

                material_request_item = get_item_details(args)
                material_request_item.update({
                    "schedule_date": get_schedule_date(material.expected_on),
                    "description": material.item_specs,
                    "item_name": material.item_specs[0:45],
                    "planning_document": material.planning_document,
                })

                update_parent_date(material.expected_on)

                doc.append("items", material_request_item)

            if not len(doc.items):
                continue

            doc.save(ignore_permissions=True)

            doclist.append(doc.name)

        return doclist
        # source fields
        # "item",
        # "item_specs",
        # "qty",
        # "uom",
        # "warehouse",
        # "request_type",
        # "planning_document",
        # "expected_on"

    def make_production_orders(self):
        pass

    def on_fetch_materials(self):
        self.on_fetch_materials_prevalidate()

        def get_product_features(item_code):
            doctype = "Item"
            name = item_code
            fields = ("ref_doctype", "ref_docname")

            ref_doctype, ref_docname = database.get_value(
                doctype, name, fields)

            if not ref_doctype or not ref_docname \
                    or not database.exists(ref_doctype, ref_docname):
                return []

            doc = frappe.get_doc(ref_doctype, ref_docname)

            options = doc.get_full_product_options()

            return options.split(", ")

        def get_expected_start_date(planning_document):
            doctype = "Planning Document"
            name = planning_document
            fieldname = "expected_start_date"

            return database.get_value(doctype, name, fieldname)

        def get_list_of_materials(product_feature):
            doctype = "List of Materials"
            filters = {
                "parent": product_feature,
                "parentfield": "materials",
                "parenttype": "Product Feature",
            }

            fields = [
                "item",
                "item_name",
                "qty",
                "uom",
                "allow_alternative_item"
            ]

            return get_all(doctype, filters, fields)

        def get_default_request_type():
            doctype = "Production Planning Materials"
            meta = frappe.get_meta(doctype)

            field = meta.get_field("request_type")

            return field.default

        def add_material(material, feature, planning_document):
            from math import ceil

            planning_material = pydict()

            planning_material.item = material.item
            planning_material.item_specs = material.item_name
            planning_material.qty = ceil(material.qty * planning_document.qty)
            planning_material.uom = material.uom
            planning_material.warehouse = self.warehouse

            planning_material.request_type = get_default_request_type()
            planning_material.planning_document = planning_document.planning_document
            planning_material.expected_on = get_expected_start_date(
                planning_document.planning_document)

            self.append("planning_materials", planning_material)

        planning_documents = self.planning_documents

        for planning_document in planning_documents:
            for feature in get_product_features(planning_document.item):
                for material in get_list_of_materials(feature):
                    add_material(material, feature, planning_document)

    def on_fetch_materials_prevalidate(self):
        planning_documents = self.planning_documents

        errmsg = translate("There should be at least one Planning Document "
                           "in the Production Planning Documents' table")

        if not planning_documents:
            frappe.throw(errmsg)

    def on_fetch_planning_documents(self):
        planning_docs = self.get_planning_documents_based_on_filters()

        for planning_doc in planning_docs:
            self.get_new_production_planning_doc(planning_doc)

    def get_new_production_planning_doc(self, planning_doc):
        def get_warehouse(doc):
            doctype = "Item Default"
            filters = {
                "company": self.company,
                "parent": doc.item,
                "parenttype": "Item",
                "parentfield": "item_defaults",
            }

            fieldname = "default_warehouse"

            return database.get_value(doctype, filters, fieldname)

        warehouse = get_warehouse(planning_doc)

        tablename = "planning_documents"
        doc = self.append(tablename, planning_doc)

        doc.warehouse = warehouse

        return doc

    def get_filters(self):
        from_date = self.from_date
        to_date = self.to_date
        sales_order = self.sales_order
        item_code = self.item_code
        customer = self.customer

        filters = pydict()

        if from_date and to_date:
            filters.expected_start_date = ["Between", [from_date, to_date]]

        if from_date and not to_date:
            filters.expected_start_date = [">=", from_date]

        if not from_date and to_date:
            filters.expected_start_date = ["<=", to_date]

        if sales_order:
            filters.sales_order = sales_order

        if item_code:
            filters.item_code = item_code

        if customer:
            filters.customer = customer

        return filters

    def get_planning_documents_based_on_filters(self):
        filters = self.get_filters()
        doctype = "Planning Document"
        fields = [
            "name As planning_document",
            "product_name",
            "item_code As item",
            "item_specifications As item_specs",
            "production_qty As qty",
        ]

        return get_all(doctype, filters, fields)

    posting_date = None
    company = None
    from_date = None
    to_date = None
    sales_order = None
    item_code = None
    customer = None
    planning_documents = list()
    warehouse = None
    planning_materials = list()
