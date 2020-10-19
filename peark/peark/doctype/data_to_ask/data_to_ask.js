// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Data to Ask', {
	refresh(frm) {
		frappe.run_serially([
			() => frm.trigger("fetch_docname_field_values"),
			() => frm.trigger("fetch_target_fieldname_values"),
		]);
	},
	source_doctype(frm) {
		frm.trigger("fetch_docname_field_values");

		frm.set_value("docname_field", null);
	},
	target_doctype(frm) {
		frm.trigger("fetch_target_fieldname_values");

		frm.set_value("target_fieldname", null);
	},
	docname_field(frm) {

	},
	fetch_target_fieldname_values(frm) {
		const { model } = frappe;

		const { doc } = frm;

		if (!doc.target_doctype) {
			frm
				.set_df_property("target_fieldname", "options", []);
			return false;
		}

		const callback = function (response) {
			const meta = frappe.get_meta(doc.target_doctype);
			const field_list = meta.fields;
			const no_value_type = frappe.model.no_value_type;

			const options = field_list
				.filter(d => !no_value_type.includes(d.fieldtype))
				.map(d => {
					return d.fieldname;
				});

			frm
				.set_df_property("target_fieldname", "options", options);

		};
		model.with_doctype(doc.target_doctype, callback);
	},
	fetch_docname_field_values(frm) {
		const { model } = frappe;

		const { doc } = frm;

		if (!doc.source_doctype) {
			frm
				.set_df_property("docname_field", "options", []);
			return false;
		}

		const callback = function (response) {
			const meta = frappe.get_meta(doc.source_doctype);
			const field_list = meta.fields;
			const no_value_type = frappe.model.no_value_type;

			const options = field_list
				.filter(d => !no_value_type.includes(d.fieldtype))
				.map(d => {
					return d.fieldname;
				});

			frm
				.set_df_property("docname_field", "options", options);

		};
		model.with_doctype(doc.source_doctype, callback);
	},
});
