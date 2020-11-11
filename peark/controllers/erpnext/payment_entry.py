# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

import frappe

from frappe import db as database


def validate(doc, method=None):
    if doc.payment_type != "Receive":
        return False

    if doc.is_new():
        return False

    if doc.db_get("workflow_state") == "Borrador" \
            and doc.workflow_state == "Pendiente":
        doc.db_set("workflow_state", "Aprobado")
