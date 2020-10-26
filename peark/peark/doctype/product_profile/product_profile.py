# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import copy

import frappe

from frappe import _ as translate

from frappe.model.document import Document
from frappe.model.rename_doc import rename_doc

from peark.controllers.erpnext.item_group import get_item_group_doc, set_item_group_code


class ProductProfile(Document):
    def autoname(self):
        pass

    def validate(self):
        self.shall_clear_backboards()

        self.remove_duplicated_paperboards()
        self.sort_paperboards()

        self.remove_duplicated_backboards()
        self.sort_backboards()

        self.remove_duplicated_dimensions()
        self.sort_dimensions()

        self.remove_duplicated_printing_features()
        self.sort_printing_features()

        self.remove_duplicated_control_features()
        self.sort_control_features()

        self.remove_duplicated_cut_features()
        self.sort_cut_features()

        self.remove_duplicated_gluing_features()
        self.sort_gluing_features()

        self.remove_duplicated_folding_features()
        self.sort_folding_features()

        self.remove_duplicated_protection_features()
        self.sort_protection_features()

        self.remove_duplicated_utils_features()
        self.sort_utils_features()

        self.remove_duplicated_texture_features()
        self.sort_texture_features()

        self.validate_paperboard_items()
        self.validate_backboard_items()

        self.validate_printing_features_items()
        self.validate_control_features_items()
        self.validate_cut_features_items()
        self.validate_gluing_features_items()
        self.validate_folding_features_items()
        self.validate_protection_features_items()
        self.validate_utils_features_items()
        self.validate_texture_features_items()

    def before_rename(self, old, new, merge=False):
        pass

    def after_rename(self, old, new, merge=False):
        self.shall_rename_item_group()

    def on_update(self):
        self.create_item_group()

        self.db_update()

    def on_trash(self):
        self.delete_item_group()

    def validate_paperboard_items(self):
        doctype = "Paperboard"
        fieldname = "backboard"
        err_msg = translate("Material {paperboard} ({material_name}) cannot be in the"
                            " {tablename} table at Row #{idx} as it is backboard.")

        for d in self.paperboards:
            docname = d.paperboard
            backboard = frappe.get_value(
                doctype, docname, fieldname)

            if backboard:
                opts = d.as_dict()

                opts.update({"tablename": translate("Paperboard")})

                frappe.throw(err_msg.format(**opts))

    def validate_backboard_items(self):
        doctype = "Paperboard"
        fieldname = "backboard"
        err_msg = translate("Material {paperboard} ({material_name}) cannot be in the"
                            " {tablename} table at Row #{idx} as it is not backboard.")

        for d in self.backboards:
            docname = d.paperboard
            backboard = frappe.get_value(
                doctype, docname, fieldname)

            if not backboard:
                opts = d.as_dict()

                opts.update({"tablename": translate("Backboard")})

                frappe.throw(err_msg.format(**opts))

    def validate_printing_features_items(self):
        doctype = "Product Feature"
        fieldname = "product_feature_type"
        err_msg = translate("{product_feature} Feature cannot be in the"
                            " {tablename} table at Row #{idx}. Please check!")

        for d in self.printing_features:
            docname = d.product_feature
            product_feature_type = frappe.get_value(
                doctype, docname, fieldname)

            if product_feature_type != "Printing":
                opts = d.as_dict()

                opts.update({"tablename": translate("Printing")})

                frappe.throw(err_msg.format(**opts))

    def validate_control_features_items(self):
        doctype = "Product Feature"
        fieldname = "product_feature_type"
        err_msg = translate("{product_feature} Feature cannot be in the"
                            " {tablename} table at Row #{idx}. Please check!")

        for d in self.control_features:
            docname = d.product_feature
            product_feature_type = frappe.get_value(
                doctype, docname, fieldname)

            if product_feature_type != "Control":
                opts = d.as_dict()

                opts.update({"tablename": translate("Control")})

                frappe.throw(err_msg.format(**opts))

    def validate_cut_features_items(self):
        doctype = "Product Feature"
        fieldname = "product_feature_type"
        err_msg = translate("{product_feature} Feature cannot be in the"
                            " {tablename} table at Row #{idx}. Please check!")

        for d in self.cutting_features:
            docname = d.product_feature
            product_feature_type = frappe.get_value(
                doctype, docname, fieldname)

            if product_feature_type != "Cut":
                opts = d.as_dict()

                opts.update({"tablename": translate("Cut")})

                frappe.throw(err_msg.format(**opts))

    def validate_gluing_features_items(self):
        doctype = "Product Feature"
        fieldname = "product_feature_type"
        err_msg = translate("{product_feature} Feature cannot be in the"
                            " {tablename} table at Row #{idx}. Please check!")

        for d in self.gluing_features:
            docname = d.product_feature
            product_feature_type = frappe.get_value(
                doctype, docname, fieldname)

            if product_feature_type != "Gluing":
                opts = d.as_dict()

                opts.update({"tablename": translate("Gluing")})

                frappe.throw(err_msg.format(**opts))

    def validate_folding_features_items(self):
        doctype = "Product Feature"
        fieldname = "product_feature_type"
        err_msg = translate("{product_feature} Feature cannot be in the"
                            " {tablename} table at Row #{idx}. Please check!")

        for d in self.folding_features:
            docname = d.product_feature
            product_feature_type = frappe.get_value(
                doctype, docname, fieldname)

            if product_feature_type != "Folding":
                opts = d.as_dict()

                opts.update({"tablename": translate("Folding")})

                frappe.throw(err_msg.format(**opts))

    def validate_protection_features_items(self):
        doctype = "Product Feature"
        fieldname = "product_feature_type"
        err_msg = translate("{product_feature} Feature cannot be in the"
                            " {tablename} table at Row #{idx}. Please check!")

        for d in self.protection_features:
            docname = d.product_feature
            product_feature_type = frappe.get_value(
                doctype, docname, fieldname)

            if product_feature_type != "Protection":
                opts = d.as_dict()

                opts.update({"tablename": translate("Protection")})

                frappe.throw(err_msg.format(**opts))

    def validate_utils_features_items(self):
        doctype = "Product Feature"
        fieldname = "product_feature_type"
        err_msg = translate("{product_feature} Feature cannot be in the"
                            " {tablename} table at Row #{idx}. Please check!")

        for d in self.utils_features:
            docname = d.product_feature
            product_feature_type = frappe.get_value(
                doctype, docname, fieldname)

            if product_feature_type != "Utils":
                opts = d.as_dict()

                opts.update({"tablename": translate("Utils")})

                frappe.throw(err_msg.format(**opts))

    def validate_texture_features_items(self):
        doctype = "Product Feature"
        fieldname = "product_feature_type"
        err_msg = translate("{product_feature} Feature cannot be in the"
                            " {tablename} table at Row #{idx}. Please check!")

        for d in self.texture_features:
            docname = d.product_feature
            product_feature_type = frappe.get_value(
                doctype, docname, fieldname)

            if product_feature_type != "Texture":
                opts = d.as_dict()

                opts.update({"tablename": translate("Texture")})

                frappe.throw(err_msg.format(**opts))

    def sort_paperboards(self):
        self.sort_items("material_name", "paperboards")

    def shall_clear_backboards(self):
        if self.has_backboard:
            return False

        self.backboards = list()

    def remove_duplicated_paperboards(self):
        self.remove_duplicated_items("paperboard", "paperboards")

    def sort_backboards(self):
        self.sort_items("material_name", "backboards")

    def remove_duplicated_backboards(self):
        self.remove_duplicated_items("paperboard", "backboards")

    def remove_duplicated_printing_features(self):
        self.remove_duplicated_items("product_feature", "printing_features")

    def sort_printing_features(self):
        self.sort_items("product_feature", "printing_features")

    def remove_duplicated_control_features(self):
        self.remove_duplicated_items("product_feature", "control_features")

    def sort_control_features(self):
        self.sort_items("product_feature", "control_features")

    def remove_duplicated_cut_features(self):
        self.remove_duplicated_items("product_feature", "cutting_features")

    def sort_cut_features(self):
        self.sort_items("product_feature", "cutting_features")

    def remove_duplicated_gluing_features(self):
        self.remove_duplicated_items("product_feature", "gluing_features")

    def sort_gluing_features(self):
        self.sort_items("product_feature", "gluing_features")

    def remove_duplicated_folding_features(self):
        self.remove_duplicated_items("product_feature", "folding_features")

    def sort_folding_features(self):
        self.sort_items("product_feature", "folding_features")

    def remove_duplicated_protection_features(self):
        self.remove_duplicated_items("product_feature", "protection_features")

    def sort_protection_features(self):
        self.sort_items("product_feature", "protection_features")

    def remove_duplicated_utils_features(self):
        self.remove_duplicated_items("product_feature", "utils_features")

    def sort_utils_features(self):
        self.sort_items("product_feature", "utils_features")

    def remove_duplicated_texture_features(self):
        self.remove_duplicated_items("product_feature", "texture_features")

    def sort_texture_features(self):
        self.sort_items("product_feature", "texture_features")

    def remove_duplicated_items(self, fieldname, tablename):
        found_list = list()

        for d in self.get(tablename):
            _found_list = [d.get(fieldname) for d in found_list]

            if d.get(fieldname) in _found_list:
                continue

            found_list.append(d)

        self.set(tablename, found_list)

    def sort_items(self, fieldname, tablename):
        items = copy.deepcopy(self.get(tablename))

        items \
            .sort(reverse=False, key=lambda d: d.get(fieldname) or "zzzzz")

        for idx, obj in enumerate(items):
            obj.set("idx", idx + 1)

        self.set(tablename, items)

    def create_item_group(self):
        item_group_name = self.name
        parent_item_group = self.parent_item_group

        item_group_doc = get_item_group_doc(item_group_name)

        if not self.item_group:
            if item_group_doc.is_new():
                item_group_doc.item_group_name = item_group_name
                item_group_doc.parent_item_group = parent_item_group

                item_group_doc.save(ignore_permissions=True)

            self.item_group = item_group_doc.name

            return "Item Group Set"

        # existing = not self.is_new()

        self.shall_rename_item_group()

    def shall_rename_item_group(self):
        doctype = "Item Group"

        if not self.item_group:
            return False

        # if self.name != self.item_group:

        item_group_doc = frappe.get_doc(doctype, self.item_group)

        # set_item_group_code(item_group_doc)

        will_rename = False

        if item_group_doc.item_group_name != self.name:
            item_group_doc.item_group_name = self.name

            item_group_doc.db_update()

            # let's rename the item group
            will_rename = True

        if will_rename:
            # you rename from `Product 1` to `Product 2` and result should be like
            # `N - Product 2`
            result = rename_doc(doctype, self.item_group, self.name)

            self.item_group = result

            # update item_group_name again
            item_group_doc = frappe.get_doc(doctype, self.item_group)
            item_group_doc.item_group_name = self.name

            item_group_doc.db_update()

    def delete_item_group(self):
        target_item_group = self.name

        if self.item_group:
            self.item_group = None

            # update db
            self.db_update()

        item_group_doc = get_item_group_doc(target_item_group)

        if item_group_doc.is_new():
            return False

        item_group_doc.delete()

    def remove_duplicated_dimensions(self):
        found_list = list()

        for d in self.dimensions:
            _found_list = [d.dimension for d in found_list]

            if d.dimension in _found_list:
                continue

            found_list.append(d)

        self.set("dimensions", found_list)

    def sort_dimensions(self):
        dimensions = copy.deepcopy(self.dimensions)

        dimensions \
            .sort(reverse=False, key=lambda d: d.dimension)

        for idx, obj in enumerate(dimensions):
            obj.set("idx", idx + 1)

        self.dimensions = dimensions

    product_profile_name = None
    old_item_name = None
    item_group = None
    parent_item_group = None
    enabled = True
    has_backboard = False
    paperboards = list()
    backboards = list()
    oneside = True
    backprinted = False
    dimensions = list()
    printing_features = list()
    control_features = list()
    cutting_features = list()
    gluing_features = list()
    folding_features = list()
    protection_features = list()
    utils_features = list()
    texture_features = list()
