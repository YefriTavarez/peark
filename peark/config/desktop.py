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
            # "icon": "fa fa-cubes",
            "icon": "fa fa-object-ungroup",
            "type": 'link',
            "link": '#List/Dimension/List',
            "color": '#FF4136',
            'standard': 1,
            # "description": "Para imprimir etiquetas a las paletas",
            "condition": has_permission(doctype="Dimension", raise_exception=False)
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
            # "description": "Para imprimir etiquetas a las paletas",
            "condition": has_permission(doctype="Product Assembly", raise_exception=False)
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
            # "description": "Para imprimir etiquetas a las paletas",
            "condition": has_permission(doctype="Product Profile", raise_exception=False)
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
            # "description": "Para imprimir etiquetas a las paletas",
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
            # "description": "Para imprimir etiquetas a las paletas",
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
            # "description": "Para imprimir etiquetas a las paletas",
            "condition": has_permission(doctype="Compound Product", raise_exception=False)
        },
        {
            "module_name": 'Planning Document',
            "category": "Places",
            "label": _('Planning Documents'),
            "icon": "fa fa-columns",
            "type": 'link',
            "link": '#List/Planning Document/List',
            "color": '#FF4136',
            'standard': 1,
            # "description": "Para imprimir etiquetas a las paletas",
            "condition": has_permission(doctype="Planning Document", raise_exception=False)
        },
        {
            "module_name": 'Planning Mission',
            "category": "Places",
            "label": _('Planning Missions'),
            "icon": "fa fa-tasks",
            "type": 'link',
            "link": '#List/Planning Mission/List',
            "color": '#FF4136',
            'standard': 1,
            # "description": "Para imprimir etiquetas a las paletas",
            "condition": has_permission(doctype="Planning Mission", raise_exception=False)
        },
    ]
