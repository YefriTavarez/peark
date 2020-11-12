# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe.utils import cstr, cint


class ListofMaterial(Document):
    list_of_material_name = None
    naming_selection = None
    naming_series = None
    items = list()
    item_set = list()
