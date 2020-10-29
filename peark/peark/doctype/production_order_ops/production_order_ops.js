// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Production Order Ops', {
    refresh(frm) {
        frappe.run_serially([
            () => frm.trigger("set_queries"),
            () => frm.trigger("enable_fields"),
        ]);
    },
    validate(frm) {
        const { doc } = frm;

        if (!doc.idx) {
            frm.trigger("prompt_to_insert_after_of");
            frappe.validated = false;
        }
    },
    set_queries(frm) {
        frappe.run_serially([
            () => frm.trigger("set_employee_query"),
            () => frm.trigger("set_workstation_query"),
        ]);
    },
    enable_fields(frm) {
        frappe.run_serially([
            () => frm.trigger("enable_product_feature_field"),
            () => frm.trigger("enable_production_order_field"),
        ]);
    },
    enable_product_feature_field(frm) {
        const fieldname = "product_feature";
        const reqd = true;
        const display = true;

        frm.toggle_reqd(fieldname, reqd);
        frm.toggle_enable(fieldname, display);
    },
    enable_production_order_field(frm) {
        const fieldname = "production_order";
        const reqd = true;
        const display = true;

        frm.toggle_reqd(fieldname, reqd);
        frm.toggle_display(fieldname, display);
    },
    set_employee_query(frm) {
        const { doc } = frm;
        const fieldname = "employee";
        const get_query = function () {
            const filters = {
                "department": [
                    "in", [
                        doc.department, doc.parent_department
                    ],
                ],
            };

            return { filters };
        };

        frm.set_query(fieldname, get_query);
    },
    set_workstation_query(frm) {
        const { doc } = frm;
        const fieldname = "work_station";
        const get_query = function () {
            const filters = {
                "department": [
                    "in", [
                        doc.department, doc.parent_department
                    ],
                ],
            };

            return { filters };
        };

        frm.set_query(fieldname, get_query);
    },
    set_parent_values(frm) {
        const { doc } = frm;

        const parentfield = "operations";
        const parenttype = "Production Order";

        doc.parentfield = parentfield;
        doc.parenttype = parenttype;
    },
    prompt_to_insert_after_of(frm) {
        const { doc } = frm;

        const fields = [
            {
                label: __("Operations"),
                fieldtype: "Link",
                fieldname: "insert_after",
                options: doc.doctype,
                reqd: true,
                get_query: {
                    "parent": doc.production_order,
                },
            },
        ];

        const primary_label = __("Continue");
        const title = __("Insert at position");

        const callback = ({ insert_after }) => {
            const doctype = doc.doctype;
            const name = insert_after;
            const fieldname = "idx";
            const callback = ({ idx }) => {
                doc.idx = idx + 1;
                frappe.run_serially([
                    () => frappe.timeout(1),
                    () => frm.save(),
                ]);
            };

            frappe.db
                .get_value(doctype, name, fieldname, callback);
        };

        frappe.prompt(fields, callback, title, primary_label);
    },
    production_order(frm) {
        const { doc } = frm;

        doc.parent = doc.production_order;

        frappe.run_serially([
            () => frm.trigger("set_parent_values"),
            () => frm.trigger("fetch_production_order"),
        ]);
    },
});
