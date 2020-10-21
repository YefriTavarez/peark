# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
import peark.controllers.cost_estimation
import peark.controllers.planning_mission
import peark.controllers.planning_document


def all():
    peark.controllers.planning_mission.set_to_delayed()


def daily():
    peark.controllers.cost_estimation.set_to_expired()
    peark.controllers.planning_document.set_to_delayed()


def hourly():
    pass


def weekly():
    pass


def monthly():
    pass
