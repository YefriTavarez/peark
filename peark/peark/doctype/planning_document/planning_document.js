// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Planning Document', {
	order_required: frm => {
		frm.toggle_reqd("sales_order", frm.doc.order_required);
	}
});
