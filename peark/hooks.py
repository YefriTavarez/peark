# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "peark"
app_title = "peark"
app_publisher = "Yefri Tavarez Nolasco"
app_description = "A totally revolutionary application specialized to the press business"
app_icon = "fa fa-cogs"
app_color = "#343443"
app_email = "yefritavarez@gmail.com"
app_license = "MIT"

# Fixtures
# ------------------
fixtures = [
    {
        "doctype": "Custom Field",
        "filters": {
            "name": [
                "in", [
                    "Employee-department_1",
                    "Employee-department_2",
                    "Employee-department_3",
                    "Employee-department_4",
                    "Employee-department_5",
                    "Employee-employee_id",
                    "Employee-is_group_1",
                    "Employee-is_group_2",
                    "Employee-is_group_3",
                    "Employee-is_group_4",
                    "Employee-is_group_5",
                    "Item Group-item_group_code",
                    "Item-column_break_109",
                    "Item-item_group_1",
                    "Item-item_group_2",
                    "Item-item_group_3",
                    "Item-item_group_4",
                    "Item-ref_childname",
                    "Item-ref_childtype",
                    "Item-ref_docname",
                    "Item-ref_doctype",
                    "Item-section_break_106",
                    "Material Request Item-planning_document",
                    "Material Request-production_planning_tool",
                    "Planning Document-expected_delivery_date",
                    "Planning Document-production_order",
                    "Purchase Order Item-planning_document",
                    "Quotation-tax_id",
                    "Sales Invoice Item-planning_document",
                    "Sales Invoice-ncf",
                    "Sales Invoice-planning_document",
                    "Sales Invoice-return_against_ncf",
                    "Workstation-department_1",
                    "Workstation-department_2",
                    "Workstation-department_3",
                    "Workstation-department_4",
                    "Workstation-department_5",
                    "Workstation-department",
                    "Workstation-is_group_1",
                    "Workstation-is_group_2",
                    "Workstation-is_group_3",
                    "Workstation-is_group_4",
                    "Workstation-is_group_5",
                ],
            ],
        },
    },
]
# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/peark/css/peark.css"
app_include_js = [
    "/assets/peark/js/peark.js",
    "/assets/peark/js/barcodescan.js",
    "/assets/peark/js/jmask.min.js",
]

# include js, css files in header of web template
# web_include_css = "/assets/peark/css/peark.css"
# web_include_js = "/assets/peark/js/peark.js"

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {
    "Department": "public/js/doctype/department.js",
    "Sales Invoice": "public/js/doctype/sales_invoice.js",
}
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
# get_website_user_home_page = "peark.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "peark.install.before_install"
# after_install = "peark.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "peark.notifications.get_notification_config"

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
        "onload": "peark.controllers.erpnext.item.onload",
        "on_update": "peark.controllers.erpnext.item.on_update",
        "before_insert": "peark.controllers.erpnext.item.before_insert",
    },
    "Item Group": {
        "before_rename": "peark.controllers.erpnext.item_group.before_rename",
        "autoname": "peark.controllers.erpnext.item_group.autoname",
    },
    "Employee": {
        "autoname": "peark.controllers.erpnext.employee.autoname",
        "on_update": "peark.controllers.erpnext.employee.on_update",
    },
    "Material Request": {
        "on_change": "peark.controllers.erpnext.material_request.on_change",
        "on_cancel": "peark.controllers.erpnext.material_request.on_cancel",
    },

    # app events
    "Paperboard": {
        "on_update": "peark.controllers.paperboard.on_update",
    },
    "Product Assembly": {
        "on_update": "peark.controllers.product_assembly.on_update",
    },

}

# Scheduled Tasks
# ---------------

scheduler_events = {
    "all": [
        "peark.tasks.all"
    ],
    "daily": [
        "peark.tasks.daily"
    ],
    "hourly": [
        "peark.tasks.hourly"
    ],
    "weekly": [
        "peark.tasks.weekly"
    ],
    "monthly": [
        "peark.tasks.monthly"
    ],
}

# Testing
# -------

# before_tests = "peark.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "peark.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "peark.task.get_dashboard_data"
# }

boot_session = "peark.controllers.boot.bootstrap"
