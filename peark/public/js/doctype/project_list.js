frappe.listview_settings['Project'] = {
	add_fields: ["status", "priority", "is_active", "percent_complete", "expected_end_date", "project_name"],
	filters: [["status", "=", "Open"]],
	get_indicator: function (doc) {
		const indicator = {
			'Open': 'orange',
			'Delayed': 'red',
			'Completed': 'green',
			'Cancelled': 'grey',
		}[doc.status];

		return [__(doc.status), indicator, "status,=," + doc.status];
	}
};
