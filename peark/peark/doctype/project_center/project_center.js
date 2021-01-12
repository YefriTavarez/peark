// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

(function ({ db, model }) {
    const ProjectCenter = {
        refresh(frm) {
            frappe.run_serially([
                () => frm.trigger("set_queries"),
                () => frm.trigger("add_fetches"),
                () => frm.trigger("toggle_display_fields"),
            ]);
        },
        after_insert(frm) {
            // console.log("after_insert");
        },
        after_save(frm) {
            frappe.run_serially([
                () => frappe.dom.freeze(),
                () => frappe.timeout(1),
                () => frm.reload_doc(),
                () => frappe.dom.unfreeze(),
            ]);
        },
        add_fetches(frm) {
            frappe.run_serially([
                () => frm.trigger("add_project_center_template_fetch"),
            ]);
        },
        toggle_display_fields(frm) {
            frappe.run_serially([
                () => frm.trigger("toggle_display_front_pantones_field"),
                () => frm.trigger("toggle_display_back_pantones_field"),
            ]);
        },
        toggle_display_front_pantones_field(frm) {
            const { doc } = frm;
            const fieldname = "front_pantones";
            const keyworkds = [
                "Color Pantone Tiro",
                "Colores Pantone Tiro"
            ];

            let display = false;
            let reqd = false;
            keyworkds.map(keyworkd => {
                if (doc.item_specifications.indexOf(keyworkd) !== -1) {
                    display = true;
                    reqd = true;
                }
            });

            frm.toggle_display(fieldname, display);
            // frm.toggle_reqd(fieldname, reqd);
        },
        toggle_display_back_pantones_field(frm) {
            const { doc } = frm;
            const fieldname = "back_pantones";
            const keyworkds = [
                "Color Pantone Retiro",
                "Colores Pantone Retiro"
            ];

            let display = false;
            let reqd = false;
            keyworkds.map(keyworkd => {
                if (doc.item_specifications.indexOf(keyworkd) !== -1) {
                    display = true;
                    reqd = true;
                }
            });

            frm.toggle_display(fieldname, display);
            // frm.toggle_reqd(fieldname, reqd);
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
        item_specifications(frm) {
            frm.trigger("toggle_display_fields");
        },
    };

    frappe.ui.form.on('Project Center', ProjectCenter);
})(frappe);
