# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
import copy

from frappe.model.document import Document

from frappe import _ as translate
from frappe.utils import cstr

from peark.controllers.utils import s_sanitize, gut


class Paperboard(Document):
    def autoname(self):
        self.update_title()
        self.name = self.title

    def validate(self):
        self.set_default_caliper()

        self.update_title()
        self.remove_duplicated_weights()
        self.remove_duplicated_dimensions()
        self.sort_weights()
        self.sort_dimensions()

    def make_name(self):
        sanitized_name = s_sanitize(self.material_name, upper=True)

        gutted = gut(sanitized_name)

        new_name = "".join(gutted)

        if self.caliper:
            new_name = "{0}{1}".format(new_name, self.caliper)

        if self.finish_type:
            new_name = "{}{}".format(new_name, self.finish_type[0])

        new_name = "{0}{1}C".format(new_name, 2 if self.double_sided else 1)

        if self.trademark:
            new_name = "{}{}".format(new_name, self.trademark[0])

        self.name = new_name

    def update_title(self):
        self.title = self.get_full_name()

    def get_full_name(self):
        # not all paperboard have caliper
        title = "{}, Calibre {}".format(self.material_name, self.caliper)

        if self.include_uom_in_title:
            caliper_uom = self.caliper_uom

            title = "{}, {}".format(title, caliper_uom.upper())

        if self.finish_type:
            title = "{}, {}".format(title, translate(self.finish_type))

        title = "{}, {}C".format(title, 2 if self.double_sided else 1)

        if self.trademark:
            title = "{}, ({})".format(title, self.trademark)

        return title

    def get_item_group(self):
        lastrow = self.item_groups[-1]
        return lastrow.item_group

    def remove_duplicated_weights(self):
        found_list = list()

        for d in self.weights:
            _found_list = [d.paperboard_weight for d in found_list]

            if d.paperboard_weight in _found_list:
                continue

            found_list.append(d)

        self.set("weights", found_list)

    def remove_duplicated_dimensions(self):
        found_list = list()

        for d in self.dimensions:
            _found_list = [d.dimension for d in found_list]

            if d.dimension in _found_list:
                continue

            found_list.append(d)

        self.set("dimensions", found_list)

    def sort_weights(self):
        weights = copy.deepcopy(self.weights)

        weights \
            .sort(reverse=False, key=lambda d: d.weight)

        for idx, obj in enumerate(weights):
            obj.set("idx", idx + 1)

        self.weights = weights

    def sort_dimensions(self):
        dimensions = copy.deepcopy(self.dimensions)

        dimensions \
            .sort(reverse=False, key=lambda d: d.dimension)

        for idx, obj in enumerate(dimensions):
            obj.set("idx", idx + 1)

        self.dimensions = dimensions

    def set_default_caliper(self):
        if not self.caliper:
            self.caliper = 0

    caliper = 0
    caliper_uom = None
    double_sided = None
    finish_type = ""
    include_uom_in_title = False
    material_name = None
    name = None
    title = None
    title_based_on = None
    trademark = ""
    weights = list()
    dimensions = list()
    item_groups = list()
