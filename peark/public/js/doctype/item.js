// Copyright (c) 2020, Yefri Tavarez and contributors
// For license information, please see license.txt

frappe.ui.form.on('Item', {
	refresh(frm) {
		frm.trigger("set_custom_queries");
	},
	before_save(frm) {
		frm.trigger("set_item_group");
	},

	validate(frm) {
		frm.trigger("validate_item_group");
	},
	set_custom_queries(frm) {
		frappe.run_serially([
			() => frm.trigger("set_item_group_1_query"),
			() => frm.trigger("set_item_group_2_query"),
			() => frm.trigger("set_item_group_3_query"),
			() => frm.trigger("set_item_group_4_query"),
			() => frm.trigger("set_item_group_5_query"),
		]);
	},
	set_item_group_1_query(frm) {
		const { root_item_group } = frappe.boot;

		frm.set_query("item_group_1", {
			filters: {
				"parent_item_group": root_item_group,
			},
		});
	},
	set_item_group_2_query(frm) {
		frm.set_query("item_group_2", doc => {
			return {
				filters: {
					"parent_item_group": doc.item_group_1,
				}
			}
		});
	},
	set_item_group_3_query(frm) {
		frm.set_query("item_group_3", doc => {
			return {
				filters: {
					"parent_item_group": doc.item_group_2,
				}
			}
		});
	},

	set_item_group_4_query(frm) {
		frm.set_query("item_group_4", doc => {
			return {
				filters: {
					"parent_item_group": doc.item_group_3,
				}
			}
		});
	},
	set_item_group_5_query(frm) {
		frm.set_query("item_group_5", doc => {
			return {
				filters: {
					"parent_item_group": doc.item_group_4,
				}
			}
		});
	},

	item_group_1(frm) {
		const { doc } = frm;

		frm.set_value("item_group", doc.item_group_1);
		frm.set_value("item_group_2", doc.null);
	},

	item_group_2(frm) {
		const { doc } = frm;

		frm.set_value("item_group", doc.item_group_2);
		frm.set_value("item_group_3", doc.null);
	},

	item_group_3(frm) {
		const { doc } = frm;

		frm.set_value("item_group", doc.item_group_3);
		frm.set_value("item_group_4", doc.null);
	},

	item_group_4(frm) {
		const { doc } = frm;

		frm.set_value("item_group", doc.item_group_4);
		// frm.set_value("item_group_5", doc.null);
	},

	item_group_5(frm) {
		const { doc } = frm;

		frm.set_value("item_group", doc.item_group_5);
		// frm.set_value("item_group_5", doc.null);
	},

	set_item_group(frm) {
	    const { doc } = frm;
	    
		doc.item_group = doc.item_group_5
			|| doc.item_group_4
			|| doc.item_group_3
			|| doc.item_group_2
			|| doc.item_group_1
		;
	},
	validate_item_group(frm) {
		const { doc } = frm;

		const item_group = doc.item_group_5
			|| doc.item_group_4
			|| doc.item_group_3
			|| doc.item_group_2
			|| doc.item_group_1
		;
		
		if (!item_group) {
			const opts = {
				message: __("Item Group is mandatory"),
				indicator: "red",
			};
			
			frappe.msgprint(opts);
			frappe.validated = false;
		}
	},
});
