# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

import frappe

from merpigc.controllers.erpnext.item_group import get_item_group_root


def bootstrap(opts):
    add_item_group_root(opts)


def add_item_group_root(opts):
    opts["root_item_group"] = get_item_group_root()
