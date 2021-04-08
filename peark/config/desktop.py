# -*- coding: utf-8 -*-
from __future__ import unicode_literals


from frappe import _
from frappe.permissions import has_permission


def get_data():
    return [
        {
            "module_name": 'Dimension',
            "category": "Places",
            "label": _('Dimensions'),
            "icon": "fa fa-object-ungroup",
            "type": 'link',
            "link": '#List/Dimension/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Dimension", raise_exception=False)
        },
        {
            "module_name": 'Product Profile',
            "category": "Places",
            "label": _('Product Profiles'),
            "icon": "fa fa-window-maximize",
            "type": 'link',
            "link": '#List/Product Profile/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Product Profile", raise_exception=False)
        },
        {
            "module_name": 'Product Assembly',
            "category": "Places",
            "label": _('Product Assemblies'),
            "icon": "fa fa-product-hunt",
            "type": 'link',
            "link": '#List/Product Assembly/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Product Assembly", raise_exception=False)
        },
        {
            "module_name": 'Item',
            "category": "Places",
            "label": _('Items'),
            "icon": "fa fa-codepen",
            "type": 'link',
            "link": '#List/Item/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Item", raise_exception=False)
        },
        {
            "module_name": 'Item Group',
            "category": "Places",
            "label": _('Item Group'),
            "icon": "fa fa-indent",
            "type": 'link',
            "link": '#Tree/Item Group',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Item Group", raise_exception=False)
        },
        {
            "module_name": 'Paperboard',
            "category": "Places",
            "label": _('Paperboards'),
            "icon": "fa fa-file-o",
            "type": 'link',
            "link": '#List/Paperboard/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Paperboard", raise_exception=False)
        },
        {
            "module_name": 'Cost Estimation',
            "category": "Places",
            "label": _('Cost Estimations'),
            "icon": "fa fa-usd",
            "type": 'link',
            "link": '#List/Cost Estimation/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Cost Estimation", raise_exception=False)
        },
        {
            "module_name": 'Compound Product',
            "category": "Places",
            "label": _('Compound Products'),
            "icon": "fa fa-cubes",
            "type": 'link',
            "link": '#List/Compound Product/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Compound Product", raise_exception=False)
        },
        {
            "module_name": 'Project Center',
            "category": "Places",
            "label": _('Project Centers'),
            "icon": "fa fa-columns",
            "type": 'link',
            "link": '#List/Project Center/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Project Center", raise_exception=False)
        },
        {
            "module_name": 'Task',
            "category": "Places",
            "label": _('Task Center'),
            "icon": "fa fa-tasks",
            "type": 'link',
            "link": '#task-center',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Task", raise_exception=False)
        },
        {
            "module_name": 'Production Planning Tool',
            "category": "Places",
            "label": _('Production Planning Tool'),
            "icon": "fa fa-text-height",
            "type": 'link',
            "link": '#List/Production Planning Tool/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Production Planning Tool", raise_exception=False)
        },
        {
            "module_name": 'Recurring Production Planning',
            "category": "Places",
            "label": _('Recurring Production Planning'),
            "icon": "fa fa-superpowers",
            "type": 'link',
            "link": '#List/Recurring Production Planning/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Recurring Production Planning", raise_exception=False)
        },
        {
            "module_name": 'Production Order',
            "category": "Places",
            "label": _('Production Order'),
            "icon": "fa fa-cog",
            "type": 'link',
            "link": '#List/Production Order/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Production Order", raise_exception=False)
        },
        {
            "module_name": 'Ton Calculation',
            "category": "Places",
            "label": _('Ton Calculation'),
            "icon": "fa fa-industry",
            "type": 'link',
            "link": '#Form/Ton Calculation',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Ton Calculation", raise_exception=False)
        },
        {
            "module_name": 'Die Cut Stocking',
            "category": "Places",
            "label": _('Die Cut Stocking'),
            "icon": "fa fa-stack-overflow",
            "type": 'link',
            "link": '#List/Die Cut Stocking/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Die Cut Stocking", raise_exception=False)
        },
        {
            "module_name": 'Material Request',
            "category": "Places",
            "label": _('Material Request'),
            "icon": "fa fa-comments-o",
            "type": 'link',
            "link": '#List/Material Request/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Material Request", raise_exception=False)
        },
        {
            "module_name": 'Sales Invoice',
            "category": "Places",
            "label": _('Sales Invoice'),
            "icon": "fa fa-bolt",
            "type": 'link',
            "link": '#List/Sales Invoice/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Sales Invoice", raise_exception=False)
        },
        {
            "module_name": 'Customer',
            "category": "Places",
            "label": _('Customer'),
            "icon": "fa fa-users",
            "type": 'link',
            "link": '#List/Customer/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Customer", raise_exception=False)
        },
        {
            "module_name": 'Supplier',
            "category": "Places",
            "label": _('Supplier'),
            "icon": "fa fa-address-book-o",
            "type": 'link',
            "link": '#List/Supplier/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Supplier", raise_exception=False)
        },
        {
            "module_name": 'Purchase Order',
            "category": "Places",
            "label": _('Purchase Order'),
            "icon": "fa fa-book",
            "type": 'link',
            "link": '#List/Purchase Order/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Purchase Order", raise_exception=False)
        },
        {
            "module_name": 'Payment Entry',
            "category": "Places",
            "label": _('Payment Entry'),
            "icon": "fa fa-money",
            "type": 'link',
            "link": '#List/Payment Entry/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Payment Entry", raise_exception=False)
        },
        {
            "module_name": 'Reminder',
            "category": "Places",
            "label": _('Reminders'),
            "icon": "fa fa-bell",
            "type": 'link',
            "link": '#reminders',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Reminder", raise_exception=False)
        },
        {
            "module_name": 'Payment Entry Request',
            "category": "Places",
            "label": _('Payment Entry Requests'),
            "icon": "fa fa-credit-card",
            "type": 'link',
            "link": '#List/Payment Entry Request/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Payment Entry Request", raise_exception=False)
        },
        {
            "module_name": 'Purchase Invoice',
            "category": "Places",
            "label": _('Purchase Invoices'),
            "icon": "fa fa-building-o",
            "type": 'link',
            "link": '#List/Purchase Invoice/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Purchase Invoice", raise_exception=False)
        },
        {
            "module_name": 'Item Description',
            "category": "Places",
            "label": _('Item Descriptions'),
            "icon": "fa fa-dot-circle-o",
            "type": 'link',
            "link": '#List/Item Description/List',
            "color": '#FF4136',
            'standard': 1,
            "condition": has_permission(doctype="Purchase Invoice", raise_exception=False)
        },
    ]
