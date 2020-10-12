// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Label Generator', {
	onload_post_render: function (frm) {
		frm.trigger("set_default_fields");
	},
	copies: function (frm) {
		const { doc } = frm;

		if (doc.copies) {
			frm.trigger("validate_copies");
		}
	},
	copies_per_page: function (frm) {
		const { doc } = frm;

		if (doc.copies_per_page) {
			frm.trigger("validate_copies");
		}
	},
	validate: function (frm) {
		frm.trigger("validate_copies");
	},
	validate_copies: function (frm) {
		const { doc } = frm;

		const err_msg = __(`Copies per page cannot be greater than total copies`);

		if (doc.copies_per_page > doc.copies) {
			frappe.validated = false;

			const opts = {
				"message": err_msg,
				"indicator": "red",
			};

			frappe.msgprint(opts);
		}
	},
	set_default_fields: function (frm) {
		const { doc } = frm;

		if (!frm.is_new()) {
			return false;
		}

		const left_values = [
			{ "label": "CLIENTE", "fieldname": "cliente", "fieldtype": "String", "upper_case": 1, "inline": 0, "value": null },
			{ "label": "OP", "fieldname": "op", "fieldtype": "String", "upper_case": 1, "inline": 1, "value": null },
			{ "label": "Trazabilidad", "fieldname": "trazabilidad", "fieldtype": "String", "upper_case": 1, "inline": 0, "value": null },
		];

		const right_values = [
			{ "label": "PRODUCTO", "fieldname": "producto", "fieldtype": "String", "upper_case": 1, "inline": 0, "value": null },
			{ "label": "CANT", "fieldname": "cant", "fieldtype": "Int", "upper_case": 0, "inline": 1, "value": null }
		];

		doc.left_fields = new Array();
		doc.right_fields = new Array();

		left_values.map(function (d) {
			frm.add_child("left_fields", d);
		});

		right_values.map(function (d) {
			frm.add_child("right_fields", d);
		});

		frm.refresh_fields();
	}
});

frappe.ui.form.on('Label Generator Field', {
	label: function (frm, cdt, cdn) {
		const doc = frappe.get_doc(cdt, cdn);

		const fieldname = "fieldname";
		const value = frappe.scrub(doc.label);

		frappe.model
			.set_value(cdt, cdn, fieldname, value);
	},
	value: function (frm, cdt, cdn) {
		const doc = frappe.get_doc(cdt, cdn);

		if (doc.upper_case) {
			doc.value = cstr(doc.value).toUpperCase();

			frm.refresh_fields();
		}
	},
});
