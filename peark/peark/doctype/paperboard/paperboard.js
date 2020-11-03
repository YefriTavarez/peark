// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Paperboard', {
	refresh(frm) {
		frappe.run_serially([
			() => frm.trigger("set_custom_queries"),
			() => frm.trigger("add_custom_buttons"),
		]);
	},
	after_save(frm) {
		frappe.run_serially([
			() => frappe.timeout(.5),
			() => frm.reload_doc(),
		]);
	},
	set_custom_queries(frm) {
		frappe.run_serially([
			() => frm.trigger("set_supported_techniques_query"),
			() => frm.trigger("set_weights_query"),
			() => frm.trigger("set_dimensions_query"),
			() => frm.trigger("set_item_groups_query"),
		]);
	},
	add_custom_buttons(frm) {
		frappe.run_serially([
			() => frm.trigger("add_view_items_button"),
		]);
	},
	set_supported_techniques_query(frm) {

		const callback = doc => {
			const { supported_techniques } = doc;

			const ignore_list = jQuery.map(supported_techniques, row => row.printing_technique);

			const opts = {
				filters: {
					name: ["not in", ignore_list.join(",")],
				}
			};

			return opts;
		};

		frm.set_query("supported_techniques", callback);
	},
	set_weights_query(frm) {

		const callback = doc => {
			const { weights } = doc;

			const ignore_list = jQuery.map(weights, row => row.paperboard_weight);

			const opts = {
				filters: {
					"name": ["not in", ignore_list.join(",")],
				}
			};

			return opts;
		};

		frm.set_query("paperboard_weight", callback);
	},
	set_dimensions_query(frm) {

		const callback = doc => {
			const { dimensions } = doc;

			const ignore_list = jQuery.map(dimensions, row => row.dimension);

			const opts = {
				filters: {
					"name": ["not in", ignore_list.join(",")],
				}
			};

			return opts;
		};

		frm.set_query("dimension", callback);
	},

	set_item_groups_query(frm) {
		const { doc } = frm;

		const get_query = function () {
			const { item_groups } = doc;

			let last_item_group = item_groups[item_groups.length - 1];

			let filters;

			if (!last_item_group) {
				filters = {
					"name": frappe.boot.root_item_group,
				};
			} else {
				filters = {
					parent_item_group: last_item_group.item_group,
				};

			}

			return { filters };
		};

		frm.set_query("item_groups", get_query);
	},
	add_view_items_button(frm) {
		const label = __("Items");
		const parent = __("View");
		const route_options = {
			"ref_doctype": frm.doctype,
			"ref_docname": frm.docname,
		};

		const action = event => {
			frappe.route_options = route_options;
			frappe.set_route("List", "Item", "List");
		};

		if (frm.is_new()) {
			return false;
		}

		frm.add_custom_button(label, action, parent);
	}
});
