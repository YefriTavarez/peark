from __future__ import unicode_literals
from frappe import _


def get_data():
    return {
        'heatmap': False,
        # 'heatmap_message': _('This is based on the attendance of this Employee'),
        'fieldname': 'production_planning_tool',
        'transactions': [
            {
                'label': _('Materials'),
                'items': ['Material Request']
            },
            {
                'label': _('Production Orders'),
                'items': []
            },
        ]
    }
