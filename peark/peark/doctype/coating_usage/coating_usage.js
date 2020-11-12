// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

// coating_name
// material_coat_usage
// coating_coverage
// print_pattern
// coating_rate
// last_purchase_rate_based_on
// item
// item_group
// item_set
// last_purchase_item
// last_purchase_rate
// last_purchase_uom

(function ({ db, model }) {
	const CoatingUsage = {
		refresh(frm) {
			frappe.run_serially([
				() => frm.trigger("set_reqd_purchase_rate_fields"),
			]);
		},

		before_save(frm) {
			frappe.run_serially([
				() => frm.trigger("clear_purchase_rate_fields"),
			]);
		},

		last_purchase_rate_based_on(frm) {
			frappe.run_serially([
				() => frm.trigger("clear_purchase_rate_fields"),
				() => frm.trigger("set_reqd_purchase_rate_fields"),
			]);
		},

		clear_purchase_rate_fields(frm) {
			const { doc } = frm;

			const conditions = {
				"item": d => d.last_purchase_rate_based_on == "Item",
				"item_group": d => d.last_purchase_rate_based_on == "Item Group",
				"item_set": d => d.last_purchase_rate_based_on == "Item Set",
			};

			for (const fieldname in conditions) {
				const condition = conditions[fieldname];

				if (!condition(doc)) {
					if (jQuery.isArray(doc[fieldname])) {
						doc[fieldname] = new Array();
					} else {
						doc[fieldname] = null;
					}
				}
			}

			frm.refresh_fields();
		},

		set_reqd_purchase_rate_fields(frm) {
			const { doc } = frm;

			const conditions = {
				"item": d => d.last_purchase_rate_based_on == "Item",
				"item_group": d => d.last_purchase_rate_based_on == "Item Group",
				"item_set": d => d.last_purchase_rate_based_on == "Item Set",
			};

			for (const fieldname in conditions) {
				const condition = conditions[fieldname];
				frm.toggle_reqd(fieldname, condition(doc));
			}
		}
	};

	frappe.ui.form.on('Coating Usage', CoatingUsage);
})(frappe);
