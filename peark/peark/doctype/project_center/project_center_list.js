frappe.listview_settings["Project Center"] = {
	add_fields: ["status", "priority"],
	filters: [["status", "=", "Open"]],
	get_indicator: function (doc) {
		let indicator = {
			"Open": "orange",
			"Delayed": "red",
			"Completed": "green",
			"Cancelled": "grey",
			"In Progress": "blue",
			"Stopped": "red",
			"Paused": "grey",
		}[doc.status];

		if (doc.status == "Open" && doc.priority == "Rush") {
			indicator = "purple";
		}

		return [__(doc.status), indicator, "status,=," + doc.status];
	},
};
