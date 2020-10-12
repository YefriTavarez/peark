// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Compound Product', {
    refresh(frm) {
        frappe.run_serially([
            () => frm.trigger("set_queries"),
            () => frm.trigger("add_custom_buttons"),
        ]);
    },
    set_queries(frm) {
        frappe.run_serially([
            () => frm.trigger("set_product_profile_query"),
            () => frm.trigger("set_product_assembly_query"),
            () => frm.trigger("set_product_assemblies_query"),
        ]);
    },

    add_custom_buttons(frm) {
        frappe.run_serially([
            () => frm.trigger("add_view_product_assembly_custom_button"),
        ]);
    },
    set_product_profile_query(frm) {
        const fieldname = "product_profile";
        const filters = {
            "is_compound_product": true,
        };

        frm.set_query(fieldname, { filters });
    },

    set_product_assembly_query(frm) {
        const { doc } = frm;
        const fieldname = "product_assembly";
        const get_query = event => {
            const filters = {
                "product_profile": doc.product_profile,
                "is_compound_product": true,
            };

            return { filters };
        };

        frm.set_query(fieldname, get_query);
    },

    set_product_assemblies_query(frm) {
        const fieldname = "product_assembly";
        const parentfield = "parts";
        const filters = {
            "is_compound_product": false,
        };

        frm.set_query(fieldname, parentfield, { filters });
    },

    add_view_product_assembly_custom_button(frm) {

        if (frm.is_new()) {
            return false;
        }

        const label = __("Product Assembly");
        const parent = __("View");
        const action = event => {
            frm.trigger("handle_view_product_assembly");
        };

        frm.add_custom_button(label, action, parent);
    },

    handle_view_product_assembly(frm) {
        const { doc } = frm;

        const route = new Array(
            "List",
            "Product Assembly",
            "List",
        );

        frappe.route_options = {
            "name": doc.product_assembly,
        };

        frappe.set_route(route)
    },

    product_profile(frm) {
        const fieldname = "product_assembly";
        frm.set_value(fieldname, null);
    },

    product_assembly(frm) {
        const fieldname = "parts";
        frm.set_value(fieldname, new Array());
    },
});
