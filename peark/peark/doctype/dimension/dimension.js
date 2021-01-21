// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Dimension', {
	width: function (frm) {
		frm.set_value("width", Math.round(frm.doc.width * 16, 0) / 16);
	},
	height: function (frm) {
		frm.set_value("height", Math.round(frm.doc.height * 16, 0) / 16);
	},
	depth: function (frm) {
		frm.set_value("depth", Math.round(frm.doc.depth * 16, 0) / 16);
	},
	after_save: function (frm) {
		const { doc } = frm;
		const {
			events: {
				dimension: {
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
			frappe.set_re_route("Form", "Dimension", new_name);

			if (!res.exc && (args.name != docname)) {
				$(document).trigger("rename", [doctype, docname, res.message || args.name]);
				if (locals[doctype] && locals[doctype][docname]) delete locals[doctype][docname];
			}
		});
	},
});

frappe.provide("frappe.events");

jQuery.extend(frappe.events, {
	dimension: {
		generate_autoname(doc) {
			const { width, width_uom, height, height_uom, depth, depth_uom } = doc;

			if (flt(width) && flt(height) && flt(depth)) {
				return `${width} ${width_uom} x ${height} ${height_uom} x ${depth} ${depth_uom}`;
			}

			if (flt(width) && flt(height)) {
				return `${width} ${width_uom} x ${height} ${height_uom}`;
			}

			if (flt(width)) {
				return `${width} ${width_uom}`;
			}
		}
	}
});