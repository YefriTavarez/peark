frappe.listview_settings["Project Center"] = {
	add_fields: ["status"],
	filters: [["status", "=", "Open"]],
	get_indicator: function (doc) {
		const indicator = {
			"Open": "orange",
			"Delayed": "red",
			"Completed": "green",
			"Cancelled": "grey",
			"In Progress": "blue",
			"Stopped": "red",
			"Paused": "grey",
		}[doc.status];

		return [__(doc.status), indicator, "status,=," + doc.status];
	}
};
