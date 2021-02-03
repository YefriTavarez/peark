// Copyright (c) 2021, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Payment Entry Request', {
	refresh(frm) {
		frappe.run_serially([
			() => frm.trigger("add_custom_buttons"),
			() => frm.trigger("update_currency_labels"),
		]);
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
	add_custom_buttons(frm) {
		frappe.run_serially([
			() => frm.trigger("add_create_payment_entry_button"),
		]);
	},
	add_create_payment_entry_button(frm) {
		const { doc } = frm;

		const parent = __("Create");
		const label = __("Payment Entry");
		const action = event => {
			frm.trigger("create_payment_entry");
		};

		const enabled_states = [
			"Aproved",
			"Paid",
		];

		if (enabled_states.includes(doc.status)) {
			frm.add_custom_button(label, action, parent);
		}
	},
	create_payment_entry(frm) {
		const { doc } = frm;

		const doctype = "Payment Entry";
		const newdoc = frappe
			.model
			.get_new_doc(doctype);

		const {
			party_type,
			party,
			party_name,
			amount,
			currency,
			reason,
			exchange_rate,
		} = doc;

		const args = {
			party_type: party_type,
			party: party,
			party_name: party_name,
			paid_amount: amount,
			received_amount: amount,
			currency: currency,
			reason: reason,
			source_exchange_rate: exchange_rate,
			target_exchange_rate: exchange_rate,
			// references: [{}]
		};

		// update args with defaults
		Object.assign(args, {
			payment_type: "Pay",
			company: frappe.boot.sysdefaults.company,
			posting_date: frappe.datetime.get_today(),
			naming_series: "SAL-PAGO-",
		});

		const route = new Array("Form");
		(route => {
			route.push(newdoc.doctype);
			route.push(newdoc.name);
		})(route);

		frappe.set_route(route)
			.then(() => {
				Object.assign(newdoc, args);
				frm.refresh();
			});
	},
	update_currency_labels(frm) {
		const { doc } = frm;

		const fields = ["amount"];

		frm.set_currency_labels(fields, doc.currency);
	},
	clear_party_name(frm) {
		const fieldname = "party_name";

		frm.set_value(fieldname, null);
	},
});
