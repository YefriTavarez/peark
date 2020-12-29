// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Sales Invoice', {
	project_center(frm) {
		const { doc } = frm;
		if (doc.project_center) {
			frm.trigger("update_children_with_project_center");
		}
	},
	update_children_with_project_center(frm) {
		const { doc } = frm;

		jQuery.map(doc.items, childoc => {
			childoc.project_center = doc.project_center;
		});

		frm.refresh_field("items");
	}
});


frappe.ui.form.on('Sales Invoice Item', {
	items_add(frm, doctype, name) {
		const doc = frappe.get_doc(doctype, name);

		doc.project_center = frm.doc.project_center;
		frm.refresh_field("fields");
	},
});