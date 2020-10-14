frappe.listview_settings["Cost Estimation"] = {
	get_indicator(doc) {
		const colors = {
			"Valid": "green",
			"Expired": "red",
		};

		let color = colors[doc.status];

		if (!color) {
			color = "grey";
		}

		const condition = ["status", "=", doc.status];
		return [__(doc.status), color, condition]
	}
}