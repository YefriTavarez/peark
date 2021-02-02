// Copyright (c) 2021, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Payment Entry Request', {
	refresh(frm) {
		frm.trigger("update_currency_labels");
	},
	party_type(frm) {
		const fieldname = "party";

		frm.set_value(fieldname, null);
	},
	party(frm) {
		frappe.run_serially([
			() => frm.trigger("clear_party_name"),
			() => frm.trigger("fetch_party_name"),
		]);
	},
	currency(frm) {
		frm.trigger("update_currency_labels");
	},
	fetch_party_name(frm) {
		const { doc } = frm;

		if (doc.party_type && doc.party) {
			frm.call("set_party_name");
		}
	},
	update_currency_labels(frm) {
		const { doc } = frm;

		const fields = [ "amount" ];

		frm.set_currency_labels(fields, doc.currency);
	},
	clear_party_name(frm) {
		const fieldname = "party_name";

		frm.set_value(fieldname, null);
	},
});
