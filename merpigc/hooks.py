# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "merpigc"
app_title = "merpigc"
app_publisher = "Yefri Tavarez Nolasco"
app_description = "Manufacturing ERP for IGC Company"
app_icon = "fa fa-cogs"
app_color = "#343443"
app_email = "yefritavarez@gmail.com"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/merpigc/css/merpigc.css"
app_include_js = [
    "/assets/merpigc/js/merpigc.js",
    "/assets/merpigc/js/jmask.min.js",
]

# include js, css files in header of web template
# web_include_css = "/assets/merpigc/css/merpigc.css"
# web_include_js = "/assets/merpigc/js/merpigc.js"

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "merpigc.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "merpigc.install.before_install"
# after_install = "merpigc.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "merpigc.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
    # erpnext
    "Item": {
        "onload": "merpigc.controllers.erpnext.item.onload",
        "on_update": "merpigc.controllers.erpnext.item.on_update",
        "before_insert": "merpigc.controllers.erpnext.item.before_insert",
    },
    "Item Group": {
        "before_rename": "merpigc.controllers.erpnext.item_group.before_rename",
        "autoname": "merpigc.controllers.erpnext.item_group.autoname",
    },
    "Employee": {
        "autoname": "merpigc.controllers.erpnext.employee.autoname",
        "on_update": "merpigc.controllers.erpnext.employee.on_update",
    },

    # app events
    "Paperboard": {
        "on_update": "merpigc.controllers.paperboard.on_update",
    },
    "Product Assembly": {
        "on_update": "merpigc.controllers.product_assembly.on_update",
    },

}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"merpigc.tasks.all"
# 	],
# 	"daily": [
# 		"merpigc.tasks.daily"
# 	],
# 	"hourly": [
# 		"merpigc.tasks.hourly"
# 	],
# 	"weekly": [
# 		"merpigc.tasks.weekly"
# 	]
# 	"monthly": [
# 		"merpigc.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "merpigc.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "merpigc.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "merpigc.task.get_dashboard_data"
# }

boot_session = "merpigc.controllers.boot.bootstrap"
