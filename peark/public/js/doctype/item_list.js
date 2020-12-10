// Copyright (c) 2020, Yefri Tavarez and contributors
// For license information, please see license.txt

frappe.provide("frappe.utils.item");

frappe.listview_settings['Item'] = {
	onload(listview) {
		const events = [
			() => frappe.timeout(1),
			() => {
				frappe.utils.item
					.set_stardard_field_filters(listview);
			},
			() => {
				frappe.utils.item
					.add_action_listeners_to_stardard_fields(listview);
			}
		];
		frappe.run_serially(events);
	},

};

jQuery.extend(frappe.utils.item, {
	set_stardard_field_filters(listview) {
		const _this = frappe.utils.item;
		const events = [
			"set_item_group_1_filter",
			"set_item_group_2_filter",
			"set_item_group_3_filter",
			"set_item_group_4_filter",
			"set_item_group_5_filter",
		];

		jQuery.map(events, function (event) {
			_this[event] && _this[event](listview);
		});
	},

	add_action_listeners_to_stardard_fields(listview) {
		const _this = frappe.utils.item;
		const events = [
			"set_item_group_1_handler",
			"set_item_group_2_handler",
			"set_item_group_3_handler",
			"set_item_group_4_handler",
			// "set_item_group_5_handler",
		];

		jQuery.map(events, function (event) {
			_this[event] && _this[event](listview);
		});
	},

	set_item_group_1_handler(listview) {
		listview.page.fields_dict.item_group_1.df.onchange = function () {
			listview.page.fields_dict.item_group_2.set_value("");

			listview.refresh();
		}
	},

	set_item_group_2_handler(listview) {
		listview.page.fields_dict.item_group_2.df.onchange = function () {
			listview.page.fields_dict.item_group_3.set_value("");

			listview.refresh();
		}
	},

	set_item_group_3_handler(listview) {
		listview.page.fields_dict.item_group_3.df.onchange = function () {
			listview.page.fields_dict.item_group_4.set_value("");

			listview.refresh();
		}
	},

	set_item_group_4_handler(listview) {
		listview.page.fields_dict.item_group_4.df.onchange = function () {
			listview.page.fields_dict.item_group_5.set_value("");

			listview.refresh();
		}
	},

	set_item_group_1_filter(listview) {
		listview.page.fields_dict.item_group_1.get_query = function () {
			const { root_item_group } = frappe.boot;
			return {
				"filters": {
					"parent_item_group": root_item_group,
				}
			};
		}
	},

	set_item_group_2_filter(listview) {
		listview.page.fields_dict.item_group_2.get_query = function () {
			return {
				"filters": {
					"parent_item_group": listview.page.fields_dict.item_group_1.value || "undefined",
				}
			};
		}
	},

	set_item_group_3_filter(listview) {
		listview.page.fields_dict.item_group_3.get_query = function () {
			return {
				"filters": {
					"parent_item_group": listview.page.fields_dict.item_group_2.value || "undefined",
				}
			};
		}
	},

	set_item_group_4_filter(listview) {
		listview.page.fields_dict.item_group_4.get_query = function () {
			return {
				"filters": {
					"parent_item_group": listview.page.fields_dict.item_group_3.value || "undefined",
				}
			};
		}
	},
	set_item_group_5_filter(listview) {
		listview.page.fields_dict.item_group_5.get_query = function () {
			return {
				"filters": {
					"parent_item_group": listview.page.fields_dict.item_group_4.value || "undefined",
				}
			};
		}
	},

});
