# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

import frappe

from frappe.utils import cint


def autoname(doc, method):
    set_new_name(doc)


def on_update(doc, method):
    update_department(doc)


def set_new_name(doc):
    set_employee_number(doc)
    doc.name = "{0}".format(doc.employee_number)


def set_employee_number(doc):
    doc.employee_number = next_employee_number()


def next_employee_number():
    return cint(current_employee_number()) + 1


def current_employee_number():
    return frappe.db.sql("select max(employee_number) from tabEmployee")[0][0]


def update_department(doc):
    department = doc.department_5 \
        or doc.department_4 \
        or doc.department_3 \
        or doc.department_2 \
        or doc.department_1

    doc.department = department
