// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Sales Invoice', {
	planning_document(frm) {
		const { doc } = frm;
		if (doc.planning_document) {
			frm.trigger("update_children_with_planning_document");
		}
	},
	update_children_with_planning_document(frm) {
		const { doc } = frm;

		jQuery.map(doc.items, childoc => {
			childoc.planning_document = doc.planning_document;
		});

		frm.refresh_field("items");
	}
});


frappe.ui.form.on('Sales Invoice Item', {
	items_add(frm, doctype, name) {
		const doc = frappe.get_doc(doctype, name);

		doc.planning_document = frm.doc.planning_document;
		frm.refresh_field("fields");
	},
});