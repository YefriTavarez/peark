# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
import copy

from frappe.model.document import Document

from frappe import _ as translate
from frappe.utils import cstr, cint, flt

from peark.controllers.utils import s_sanitize, gut


class Paperboard(Document):
    def autoname(self):
        self.update_title()
        self.name = self.title

    def validate(self):
        self.validate_double_sided()
        self.update_title()
        self.sort_dimensions()

    def validate_double_sided(self):
        if self.one_side:
            return False

        self.double_sided = False

    def update_title(self):
        self.title = self.get_full_name(comma_separated=True)

    def get_full_name(self, weight_or_caliper=None, ignore_trademark=False, comma_separated=False):
        def display_value(fieldname):
            value = self.get(fieldname)
            translated_value = translate(value)

            return translated_value

        fields = [
            "material_type",
            "color",
            "segment",
            "finish_type",
            "coated_sides",
        ]

        if not self.ignore_composition:
            fields.append("composition")

        fields.extend([
            "trademark" if not ignore_trademark else "fakefield",
            "model" if not ignore_trademark else "fakefield",
            "caliper",
            "weight",
        ])

        return (", " if comma_separated else " ") \
            .join(display_value(fieldname) for fieldname in fields
                  if self.get(fieldname)
                  )

    def get_item_group(self):
        lastrow = self.item_groups[-1]
        return lastrow.item_group

    def sort_dimensions(self):
        dimensions = copy.deepcopy(self.dimensions)

        dimensions \
            .sort(reverse=False, key=lambda d: d.dimension)

        for idx, obj in enumerate(dimensions):
            obj.set("idx", idx + 1)

        self.dimensions = dimensions

    title = None
    enabled = True
    backboard = None
    material_type = None
    segment = None
    color = None
    coated_sides = None
    ignore_composition = False
    composition = None
    finish_type = None
    material_name = None
    trademark = None
    model = None
    one_side = True
    double_sided = False
    item_groups = list()
    caliper = .0
    weight = .0
    last_purchase_rate = .0
    dimensions = list()
