// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Department', {
	refresh(frm) {
		frappe.run_serially([
			() => frm.trigger("set_queries"),
		]);
	},
	set_queries(frm) {
		frappe.run_serially([
			() => frm.trigger("set_parent_query"),
		]);
	},
	set_parent_query(frm) {
		const fieldname = "parent_department";
		const filters = {
			"is_group": true,
		};

		frm.set_query(fieldname, filters);
	},

});