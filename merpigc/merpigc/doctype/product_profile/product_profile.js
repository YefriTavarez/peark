// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Product Profile', {
	refresh(frm) {
		frappe.run_serially([
			() => frm.trigger("set_custom_queries"),
			() => frm.trigger("add_custom_buttons"),
			() => frm.trigger("toggle_read_only_fields"),
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
			() => frm.trigger("set_item_group_query"),
			() => frm.trigger("set_paperboard_query"),
			() => frm.trigger("set_backboard_query"),
			() => frm.trigger("set_dimensions_query"),
			() => frm.trigger("set_control_query"),
			() => frm.trigger("set_cut_query"),
			() => frm.trigger("set_gluing_query"),
			() => frm.trigger("set_folding_query"),
			() => frm.trigger("set_protection_query"),
			() => frm.trigger("set_utils_query"),
			() => frm.trigger("set_texture_query"),
		]);
	},
	add_custom_buttons(frm) {
		frappe.run_serially([
			() => frm.trigger("add_view_product_assemblies_button"),
		]);
	},
	set_item_group_query(frm) {
		const { doc } = frm;
		const opts = {
			filters: {
				parent_item_group: doc.parent_item_group,
			}
		};

		frm.set_query("item_group", opts);
	},
	set_paperboard_query(frm) {
		const tablename = "paperboards";
		const fieldname = "paperboard";

		const query = function () {
			const { doc } = frm;
			const chosen_paperboards = jQuery
				.map(doc.paperboards, d => d.paperboard)
				.join(",");

			return {
				filters: {
					"backboard": false,
					"name": ["not in", chosen_paperboards],
				}
			};
		};

		frm.set_query(fieldname, tablename, query);
	},
	set_backboard_query(frm) {
		const tablename = "backboards";
		const fieldname = "paperboard";

		const query = function () {
			const { doc } = frm;
			const chosen_paperboards = jQuery
				.map(doc.backboards, d => d.paperboard)
				.join(",");

			return {
				filters: {
					"backboard": true,
					"name": ["not in", chosen_paperboards],
				}
			};
		};

		frm.set_query(fieldname, tablename, query);
	},
	toggle_read_only_fields(frm) {
		frappe.run_serially([
			() => frm.trigger("toggle_read_only_item_group"),
		]);
	},
	toggle_read_only_item_group(frm) {
		frm.toggle_enable("item_group", frm.is_new());
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

		frm.set_query("dimension", "dimensions", callback);
	},

	set_control_query(frm) {
		const tablename = "control_features";
		const fieldname = "product_feature";

		const query = function () {
			const { doc } = frm;
			const chosen_control_features = jQuery
				.map(doc.control_features, d => d.product_feature)
				.join(",");

			return {
				filters: {
					"product_feature_type": "Control",
					"name": ["not in", chosen_control_features],
				}
			};
		};

		frm.set_query(fieldname, tablename, query);
	},
	set_cut_query(frm) {
		const tablename = "cutting_features";
		const fieldname = "product_feature";

		const query = function () {
			const { doc } = frm;
			const chosen_cutting_features = jQuery
				.map(doc.cutting_features, d => d.product_feature)
				.join(",");

			return {
				filters: {
					"product_feature_type": "Cut",
					"name": ["not in", chosen_cutting_features],
				}
			};
		};

		frm.set_query(fieldname, tablename, query);
	},
	set_gluing_query(frm) {
		const tablename = "gluing_features";
		const fieldname = "product_feature";

		const query = function () {
			const { doc } = frm;
			const chosen_gluing_features = jQuery
				.map(doc.gluing_features, d => d.product_feature)
				.join(",");

			return {
				filters: {
					"product_feature_type": "Gluing",
					"name": ["not in", chosen_gluing_features],
				}
			};
		};

		frm.set_query(fieldname, tablename, query);
	},
	set_folding_query(frm) {
		const tablename = "folding_features";
		const fieldname = "product_feature";

		const query = function () {
			const { doc } = frm;
			const chosen_folding_features = jQuery
				.map(doc.folding_features, d => d.product_feature)
				.join(",");

			return {
				filters: {
					"product_feature_type": "Folding",
					"name": ["not in", chosen_folding_features],
				}
			};
		};

		frm.set_query(fieldname, tablename, query);
	},
	set_protection_query(frm) {
		const tablename = "protection_features";
		const fieldname = "product_feature";

		const query = function () {
			const { doc } = frm;
			const chosen_protection_features = jQuery
				.map(doc.protection_features, d => d.product_feature)
				.join(",");

			return {
				filters: {
					"product_feature_type": "Protection",
					"name": ["not in", chosen_protection_features],
				}
			};
		};

		frm.set_query(fieldname, tablename, query);
	},
	set_utils_query(frm) {
		const tablename = "utils_features";
		const fieldname = "product_feature";

		const query = function () {
			const { doc } = frm;
			const chosen_utils_features = jQuery
				.map(doc.utils_features, d => d.product_feature)
				.join(",");

			return {
				filters: {
					"product_feature_type": "Utils",
					"name": ["not in", chosen_utils_features],
				}
			};
		};

		frm.set_query(fieldname, tablename, query);
	},
	set_texture_query(frm) {
		const tablename = "texture_features";
		const fieldname = "product_feature";

		const query = function () {
			const { doc } = frm;
			const chosen_texture_features = jQuery
				.map(doc.texture_features, d => d.product_feature)
				.join(",");

			return {
				filters: {
					"product_feature_type": "Texture",
					"name": ["not in", chosen_texture_features],
				}
			};
		};

		frm.set_query(fieldname, tablename, query);
	},
	add_view_product_assemblies_button(frm) {
		if (frm.is_new()) {
			return false;
		}

		const label = __("Product Assemblies");
		const parent = __("View");
		const action = event => {
			frappe.route_options = {
				"product_profile": frm.docname,
			};
			frappe.set_route("List", "Product Assembly", "List");
		};

		frm.add_custom_button(label, action, parent);
	}
});
