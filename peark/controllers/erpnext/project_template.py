# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe


def validate(doc, method=None):
    set_department_if_missing(doc)


def set_department_if_missing(doc):
    if not doc.get("department"):
        return False

    for task in doc.get("tasks"):
        # don't override
        if task.department:
            continue

        task.department = doc.department
