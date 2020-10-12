// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Paperboard Weight', {
	after_save(frm) {
		const { doc } = frm;
		const {
			events: {
				paperboard_weight: {
					generate_autoname,
				}
			},
		} = frappe;

		const doctype = doc.doctype;
		const docname = doc.name;

		const new_name = generate_autoname(doc);

		if (new_name == docname) {
			return false;
		}

		let args = {
			"new_name": new_name,
			"name": docname,
		};

		// let title_field = frm.meta.title_field || '';

		frappe.call({
			method: "frappe.model.rename_doc.update_document_title",
			args: {
				doctype,
				docname,
				// title_field,
				old_title: args.name,
				new_title: null,
				new_name: args.new_name,
				merge: 0
			},
			btn: frm.page.btn_primary,
		}).then((res) => {
			frappe.set_re_route("Form", "Paperboard Weight", new_name);

			if (!res.exc && (args.name != docname)) {
				$(document).trigger("rename", [doctype, docname, res.message || args.name]);
				if (locals[doctype] && locals[doctype][docname]) delete locals[doctype][docname];
			}
		});
	},
});

frappe.provide("frappe.events");

jQuery.extend(frappe.events, {
	paperboard_weight: {
		generate_autoname(doc) {
			const { weight, weight_uom } = doc;
			return `${weight} ${weight_uom}`;
		}
	}
});