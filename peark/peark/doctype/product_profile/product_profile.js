// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Product Profile', {
	refresh(frm) {
		frappe.run_serially([
			() => frm.trigger("set_custom_queries"),
			() => frm.trigger("add_custom_buttons"),
			() => frm.trigger("toggle_reqd_fields"),
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
			() => frm.trigger("set_item_groups_query"),
			() => frm.trigger("set_paperboard_query"),
			() => frm.trigger("set_backboard_query"),
			() => frm.trigger("set_dimensions_query"),
			() => frm.trigger("set_printing_query"),
			() => frm.trigger("set_control_query"),
			() => frm.trigger("set_cut_query"),
			() => frm.trigger("set_gluing_query"),
			() => frm.trigger("set_folding_query"),
			() => frm.trigger("set_protection_query"),
			() => frm.trigger("set_utils_query"),
			() => frm.trigger("set_texture_query"),
			() => frm.trigger("set_packing_query"),
		]);
	},
	add_custom_buttons(frm) {
		frappe.run_serially([
			() => frm.trigger("add_view_product_assemblies_button"),
		]);
	},
	set_item_groups_query(frm) {
		const { doc } = frm;

		const get_query = function () {
			let { item_groups } = doc;

			if (!item_groups) {
				item_groups = new Array();
			}

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

		frm.set_query(fieldname, query);
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

		frm.set_query(fieldname, query);
	},
	toggle_reqd_fields(frm) {
		frappe.run_serially([
			() => frm.trigger("toggle_reqd_printing_fields"),
			() => frm.trigger("toggle_reqd_control_fields"),
			() => frm.trigger("toggle_reqd_cutting_fields"),
			() => frm.trigger("toggle_reqd_gluing_fields"),
			() => frm.trigger("toggle_reqd_folding_fields"),
			() => frm.trigger("toggle_reqd_protection_fields"),
			() => frm.trigger("toggle_reqd_utils_fields"),
			() => frm.trigger("toggle_reqd_texture_fields"),
		]);
	},

	toggle_read_only_fields(frm) {
		frappe.run_serially([
			() => frm.trigger("toggle_read_only_item_group"),
		]);
	},

	toggle_reqd_printing_fields(frm) {
		const { doc } = frm;
		const reqd = doc.allow_printing;
		const fields = [
			"printing_features",
		];

		frm.toggle_reqd(fields, reqd);
	},

	toggle_reqd_control_fields(frm) {
		const { doc } = frm;
		const reqd = doc.allow_control;
		const fields = [
			"control_features",
		];

		frm.toggle_reqd(fields, reqd);
	},

	toggle_reqd_cutting_fields(frm) {
		const { doc } = frm;
		const reqd = doc.allow_cutting;
		const fields = [
			"cutting_features",
		];

		frm.toggle_reqd(fields, reqd);
	},

	toggle_reqd_gluing_fields(frm) {
		const { doc } = frm;
		const reqd = doc.allow_gluing;
		const fields = [
			"gluing_features",
		];

		frm.toggle_reqd(fields, reqd);
	},

	toggle_reqd_folding_fields(frm) {
		const { doc } = frm;
		const reqd = doc.allow_folding;
		const fields = [
			"folding_features",
		];

		frm.toggle_reqd(fields, reqd);
	},

	toggle_reqd_protection_fields(frm) {
		const { doc } = frm;
		const reqd = doc.allow_protection;
		const fields = [
			"protection_features",
		];

		frm.toggle_reqd(fields, reqd);
	},

	toggle_reqd_utils_fields(frm) {
		const { doc } = frm;
		const reqd = doc.allow_utils;
		const fields = [
			"utils_features",
		];

		frm.toggle_reqd(fields, reqd);
	},

	toggle_reqd_texture_fields(frm) {
		const { doc } = frm;
		const reqd = doc.allow_texture;
		const fields = [
			"texture_features",
		];

		frm.toggle_reqd(fields, reqd);
	},

	toggle_reqd_packing_fields(frm) {
		const { doc } = frm;
		const reqd = doc.allow_packing;
		const fields = [
			"packing_features",
		];

		frm.toggle_reqd(fields, reqd);
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

		frm.set_query("dimension", callback);
	},

	set_printing_query(frm) {
		const fieldname = "printing_features";

		const query = function () {
			const { doc } = frm;
			const chosen_printing_features = jQuery
				.map(doc.printing_features, d => d.product_feature)
				.join(",");

			return {
				filters: {
					"product_feature_type": "Printing",
					"name": ["not in", chosen_printing_features],
				}
			};
		};

		frm.set_query(fieldname, query);
	},

	set_control_query(frm) {
		const fieldname = "control_features";

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

		frm.set_query(fieldname, query);
	},

	set_cut_query(frm) {
		const fieldname = "cutting_features";

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

		frm.set_query(fieldname, query);
	},
	set_gluing_query(frm) {
		const fieldname = "gluing_features";

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

		frm.set_query(fieldname, query);
	},
	set_folding_query(frm) {
		const fieldname = "folding_features";

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

		frm.set_query(fieldname, query);
	},
	set_protection_query(frm) {
		const fieldname = "protection_features";

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

		frm.set_query(fieldname, query);
	},
	set_utils_query(frm) {
		const fieldname = "utils_features";

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

		frm.set_query(fieldname, query);
	},
	set_texture_query(frm) {
		const fieldname = "texture_features";

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

		frm.set_query(fieldname, query);
	},
	set_packing_query(frm) {
		const fieldname = "packing_features";

		const query = function () {
			const { doc } = frm;
			const chosen_packing_features = jQuery
				.map(doc.packing_features, d => d.product_feature)
				.join(",");

			return {
				filters: {
					"product_feature_type": "Packing",
					"name": ["not in", chosen_packing_features],
				}
			};
		};

		frm.set_query(fieldname, query);
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
	},
	allow_printing(frm) {
		frm.trigger("toggle_reqd_printing_fields");
	},
	allow_control(frm) {
		frm.trigger("toggle_reqd_control_fields");
	},
	allow_cutting(frm) {
		frm.trigger("toggle_reqd_cutting_fields");
	},
	allow_gluing(frm) {
		frm.trigger("toggle_reqd_gluing_fields");
	},
	allow_folding(frm) {
		frm.trigger("toggle_reqd_folding_fields");
	},
	allow_protection(frm) {
		frm.trigger("toggle_reqd_protection_fields");
	},
	allow_utils(frm) {
		frm.trigger("toggle_reqd_utils_fields");
	},
	allow_texture(frm) {
		frm.trigger("toggle_reqd_texture_fields");
	},
	allow_packing(frm) {
		frm.trigger("toggle_reqd_packing_fields");
	},
});
