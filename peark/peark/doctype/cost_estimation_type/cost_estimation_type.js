// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt
(function ({ model, db }) {
    const CostEstimationType = {
        setup(frm) {
            frappe.run_serially([
                () => frm.trigger("hide_amount_columns"),
            ]);
        },
        refresh(frm) {
            frappe.run_serially([
                () => frm.trigger("add_custom_buttons"),
            ]);
        },
        add_custom_buttons(frm) {
            frappe.run_serially([
                () => frm.trigger("add_create_estimation_button"),
            ]);
        },
        add_create_estimation_button(frm) {
            if (frm.is_new()) {
                return false;
            }

            const label = __("Cost Estimation");
            const parent = __("Create");
            const action = function (event) {
                frm.trigger("handle_create_cost_estimation");
            };

            frm.add_custom_button(label, action, parent);
        },
        hide_amount_columns(frm) {
            const tablenames = [
                "default_fixed_costs",
                "default_variable_costs",
            ];

            jQuery.map(tablenames, tablename => {
                const { hide_amount_column } = CostEstimationType;

                hide_amount_column(frm, tablename);
            });
        },
        hide_amount_column(frm, tablename) {
            const docfield = frm
                .get_field(tablename);

            if (!docfield) {
                return false;
            }

            const tablegrid = docfield.grid;

            const fieldname = "amount";
            const display = false;

            if (!tablegrid) {
                return false;
            }

            tablegrid
                .set_column_disp(fieldname, display);
        },
        handle_create_cost_estimation(frm) {
            const { doc } = frm;

            const doctype = "Cost Estimation";
            const opts = {
                "cost_estimation_type": doc.name
            };
            
            frappe.new_doc(doctype, opts);
        },
    };

    frappe.ui.form.on('Cost Estimation Type', CostEstimationType);
})(frappe);
