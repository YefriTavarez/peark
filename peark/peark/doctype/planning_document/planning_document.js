// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Planning Document', {
    refresh(frm) {
        frappe.run_serially([
            () => frm.trigger("set_queries"),
            () => frm.trigger("toggle_reqd_sales_order"),
            () => frm.trigger("toggle_reqd_template_planning_fields"),
        ]);
    },
    set_queries(frm) {
        frappe.run_serially([
            () => frm.trigger("set_item_code_query"),
            () => frm.trigger("set_sales_order_query"),
        ]);
    },
    set_item_code_query(frm) {
        const fieldname = "item_code";
        const get_query = event => {
            const filters = {
                "include_item_in_manufacturing": true,
            };

            return { filters };
        };

        frm.set_query(fieldname, get_query);
    },
    set_sales_order_query(frm) {
        const { doc } = frm;
        const fieldname = "sales_order";

        const get_query = event => {
            const filters = {
                "customer": doc.customer,
            };

            return { filters };
        };

        frm.set_query(fieldname, get_query);
    },
    toggle_reqd_sales_order(frm) {
        const { doc } = frm;
        const fieldname = "sales_order";

        frm.toggle_reqd(fieldname, doc.order_required);
    },
    toggle_reqd_template_planning_fields(frm) {
        const { doc } = frm;
        const fields = [
            "customer",
            "product_name",
        ];

        frm.toggle_reqd(fields, doc.order_required);
    },
    order_required(frm) {
        // this is unlikely to be used
        frm.trigger("toggle_reqd_sales_order");
    },
    item_code(frm) {
        const { doc } = frm;

        doc.item_specifications = null;

        if (doc.item_code) {
            // frm.call("serverobj");
        } else {
            doc.item_name = null;
        }

        frm.refresh_fields();
    },
    planning_template(frm) {
        const { doc } = frm;

        if (doc.planning_template) {
            frm.call("fetch_from_planning_template")
                .then(() => frm.trigger("after_planning_template_mapping"),
                    () => frm.set_value("planning_template", null));
        }

        frm.refresh_fields();
    },
    after_planning_template_mapping(frm) {
        frappe.run_serially([
            () => frm.trigger("toggle_reqd_sales_order"),
            () => frm.trigger("toggle_reqd_template_planning_fields"),
        ]);
    }
});

frappe.ui.form.on('Planning Mission', {

});