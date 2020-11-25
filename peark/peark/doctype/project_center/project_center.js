// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

(function ({ db, model }) {
    const ProjectCenter = {
        refresh(frm) {
            frappe.run_serially([
                () => frm.trigger("set_queries"),
                () => frm.trigger("add_fetches"),
            ]);
        },
        add_fetches(frm) {
            frappe.run_serially([
                () => frm.trigger("add_project_center_template_fetch"),
            ]);
        },
        set_queries(frm) {
            frappe.run_serially([
                () => frm.trigger("set_sales_order_query"),
            ]);
        },
        set_sales_order_query(frm) {
            const { doc } = frm;
            const fieldname = "sales_order";
            const get_query = function () {
                const filters = {
                    "customer": doc.customer,
                };

                return { filters };
            };

            frm.set_query(fieldname, get_query);
        },
        add_project_center_template_fetch(frm) {
            const link_field = "project_center_template";
            const source_field = "order_required";
            const target_field = "order_required";

            frm.add_fetch(link_field, source_field, target_field);
        },
        order_required(frm) {
            const { doc } = frm;
            const fieldlist = [
                "customer",
                "sales_order",
                "product_name",
            ];

            frm.toggle_reqd(fieldlist, doc.order_required);
        },
    };

    frappe.ui.form.on('Project Center', ProjectCenter);
})(frappe);
