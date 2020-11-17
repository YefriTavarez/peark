// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt
(({ db, model }) => {

    const ListofMaterialDetail = {
        refresh(frm) {
            frappe.run_serially([
                () => frm.trigger("set_queries"),
                () => frm.trigger("toggle_reqd_item_based_fields"),
            ]);
        },
        before_save(frm) {
            frm.trigger("clear_item_based_fields");
        },
        set_queries(frm) {
            frm.trigger("set_item_set_query");
        },
        set_item_set_query(frm) {
            const fieldname = "item_set";
            const get_query = function () {
                let item_set = frm.doc[fieldname];

                if (!item_set) {
                    item_set = new Array();
                }

                const selected_items = item_set.map(d => d.item);

                const filters = {
                    "name": ["not in", selected_items]
                };

                return { filters };
            };
            frm.set_query(fieldname, get_query);
        },
        last_purchase_rate_based_on(frm) {
            frm.trigger("toggle_reqd_item_based_fields");
        },
        toggle_reqd_item_based_fields(frm) {
            const { doc } = frm;

            if (doc.last_purchase_rate_based_on == "Item") {
                frm.toggle_reqd("item", true);
                frm.toggle_reqd("item_group", false);
                frm.toggle_reqd("item_set", false);
            } else if (doc.last_purchase_rate_based_on == "Item Group") {
                frm.toggle_reqd("item", false);
                frm.toggle_reqd("item_group", true);
                frm.toggle_reqd("item_set", false);
            } else {
                frm.toggle_reqd("item", false);
                frm.toggle_reqd("item_group", false);
                frm.toggle_reqd("item_set", true);
            }
        },
        clear_item_based_fields(frm) {
            const { doc } = frm;

            if (doc.last_purchase_rate_based_on == "Item") {
                frm.set_value("item_group", null);
                frm.set_value("item_set", new Array());
            } else if (doc.last_purchase_rate_based_on == "Item Group") {
                frm.set_value("item", null);
                frm.set_value("item_set", new Array());
            } else {
                frm.set_value("item", null);
                frm.set_value("item_group", null);
            }
        }
    };

    frappe.ui.form.on('List of Material Detail', ListofMaterialDetail);
})(frappe);