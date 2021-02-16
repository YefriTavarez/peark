# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe

import peark.controllers.cost_estimation
import peark.controllers.planning_mission
import peark.controllers.planning_document
import peark.controllers.project_center
import peark.controllers.project
import peark.controllers.payment_entry_request
import peark.controllers.material_request
import peark.controllers.purchase_order


def all():
    peark.controllers.project.set_to_delayed()
    peark.controllers.project_center.update_projects()


def daily():
    peark.controllers.cost_estimation.set_to_expired()
    peark.controllers.payment_entry_request.set_to_delayed()
    peark.controllers.planning_document.set_to_delayed()


def hourly():
    peark.controllers.material_request.notify_for_unresolved()
    peark.controllers.purchase_order.notify_for_unresolved()

    # finally
    frappe.db.commit()


def weekly():
    pass


def monthly():
    pass
