// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

(({ db, model }) => {

    const CostEstimation = {
        refresh(frm) {
            frappe.run_serially([
                () => frm.trigger("set_queries"),
                () => frm.trigger("add_custom_buttons"),
                () => frm.trigger("set_masks"),
            ]);
        },

        set_queries(frm) {
            frappe.run_serially([
                () => frm.trigger("set_product_profile_query"),
                () => frm.trigger("set_product_assembly_query"),
                () => frm.trigger("set_sales_person_query"),
            ]);
        },

        add_custom_buttons(frm) {
            frappe.run_serially([
                () => frm.trigger("add_custom_make_quotation_button"),
            ]);
        },

        set_masks(frm) {
            frappe.run_serially([
                () => frm.trigger("set_commission_rate_mask"),
            ]);
        },


        set_product_profile_query(frm) {
            const filters = {
                "enabled": true,
            };

            frm.set_query("product_profile", { filters });
        },

        set_product_assembly_query(frm) {
            const { doc } = frm;

            frm.set_query("product_assembly", event => {

                const filters = {
                    "product_profile": doc.product_profile,
                    "is_compound_product": doc.is_compound_product,
                };
                return { filters };
            });
        },

        set_sales_person_query(frm) {
            const filters = {
                "is_group": false,
            };

            frm.set_query("sales_person", { filters });
        },

        add_custom_make_quotation_button(frm) {
            const { doc } = frm;
            const { db } = frappe;

            if (frm.is_new()) {
                return false;
            }

            const doctype = "Quotation";

            const filters = {
                "cost_estimation": doc.name,
                "docstatus": ["!=", 2],
            };

            const fieldname = "name";

            const callback = ({ name }) => {
                if (!name) {
                    frm.trigger("show_make_quotation_button");
                    return false;
                }

                CostEstimation
                    .show_view_quotation_button(frm, name);

            };

            db.get_value(doctype, filters, fieldname, callback);
        },

        show_make_quotation_button(frm) {
            const { doc } = frm;
            if (frm.is_new()) {
                return false;
            }

            const label = __("Quotation");
            const parent = __("Create");
            const action = () => {
                if (frm.is_dirty()) {
                    frappe.throw(__("Save changes."));
                }

                frm.trigger("handle_make_quotation");
            };

            frm.add_custom_button(label, action, parent);
        },

        show_view_quotation_button(frm, name) {
            const { doc } = frm;

            if (frm.is_new()) {
                return false;
            }

            if (!name) {
                return false;
            }

            const label = __("Quotation");
            const parent = __("View");
            const action = () => {
                CostEstimation
                    .handle_view_quotation(frm, name);
            };

            frm.add_custom_button(label, action, parent);
        },

        set_commission_rate_mask(frm) {
            const selector = "input[data-fieldname=commission_rate]";
            const mask = "00.000";

            jQuery(selector).mask(mask, { reverse: true });
        },

        set_qty_to_produce_mask(frm) {
            const selector = "input[data-fieldname=qty_to_produce]";
            const mask = "000,000,000,000,000";

            jQuery(selector).mask(mask, { reverse: true });
        },

        set_units_per_sheet_mask(frm) {
            const selector = "input[data-fieldname=units_per_sheet]";
            const mask = "000,000";

            jQuery(selector).mask(mask, { reverse: true });
        },

        set_default_costs(frm) {
            const { doc } = frm;

            const { __onload } = doc;
            const { fixed_costs, variable_costs } = doc;

            if (!__onload) {
                return false;
            }

            const { cost_estimation_type } = __onload;

            if (!cost_estimation_type) {
                return false;
            }

            if (fixed_costs.length == 1) {
                const [row] = fixed_costs;

                if (!row.cost_specification) {
                    frm.set_value("fixed_costs", new Array());
                }
            }

            if (variable_costs.length == 1) {
                const [row] = variable_costs;

                if (!row.cost_specification) {
                    frm.set_value("variable_costs", new Array());
                }
            }

            if (!doc.fixed_costs.length) {
                cost_estimation_type
                    .default_fixed_costs
                    .map(row => {
                        const {
                            cost_specification,
                            rate,
                        } = row;

                        frm.add_child("fixed_costs", {
                            cost_specification,
                            rate,
                        });
                    });

                frm.refresh_fields();
            }

            if (!doc.variable_costs.length) {
                cost_estimation_type
                    .default_variable_costs
                    .map(row => {
                        const {
                            cost_specification,
                            rate,
                            qty,
                            amount
                        } = row;

                        frm.add_child("variable_costs", {
                            cost_specification,
                            rate,
                            qty,
                            amount
                        });
                    });

                frm.refresh_fields();
            }
        },

        handle_make_quotation(frm) {
            // const { doc } = frm;
            const { model } = frappe;

            const method = "make_quotation";

            frm.call(method)
                .then(({ message }) => {
                    const view = "Form";

                    const [doc] = model.sync(message);
                    const { doctype, name } = doc;

                    frappe.set_route(view, doctype, name);
                });
        },

        handle_view_quotation(frm, name) {
            const view = "Form";
            const doctype = "Quotation";

            frappe.set_route(view, doctype, name)
        },

        cost_estimation_type(frm) {
            const { doc } = frm;

            if (!doc.cost_estimation_type) {
                return false;
            }

            frm.call("fetch_cost_estimation_type")
                .then(() => {
                    frm.trigger("set_default_costs");
                });
        },

        product_profile(frm) {
            frm.set_value("product_assembly", null);
        },

        product_assembly(frm) {
            const { doc } = frm;

            if (!doc.product_assembly) {
                return false;
            }

            frm.call("fetch_product_assembly")
                .then(() => {
                    frm.trigger("add_product_assembly_options");
                }, () => {
                    frm.set_value("product_assembly", null);
                    frm.set_value("product_assembly_specification", null);
                });
        },

        cost_estimation_validity_days(frm) {
            const { doc } = frm;

            if (!doc.cost_estimation_validity_days) {
                return false;
            }

            frm.trigger("update_valid_until_date");
        },

        generated_on(frm) {
            const { doc } = frm;

            if (!doc.generated_on) {
                return false;
            }

            frm.trigger("update_valid_until_date");
        },

        qty_to_produce(frm) {
            const { doc } = frm;

            if (!doc.qty_to_produce) {
                return false;
            }

            frm.trigger("calculate_sub_total");
        },

        sales_person(frm) {
            const { doc } = frm;

            if (!doc.sales_person) {
                frm.set_value("commission_rate", 0.000);

                return false;
            }

        },

        commission_rate(frm) {
            const { doc } = frm;


            if (!doc.commission_rate) {
                if (typeof doc.commission_rate == "string") {
                    return false;
                }
            }

            frm.trigger("calculate_commission_amount");
        },

        commission_amount(frm) {
            const { doc } = frm;

            if (!doc.commission_rate) {
                return false;
            }

            frm.trigger("calculate_commission_amount");

        },

        margin_rate_1(frm) {
            const { doc } = frm;


            if (!doc.margin_rate_1) {
                if (typeof doc.margin_rate_1 == "string") {
                    return false;
                }
            }

            frm.trigger("calculate_margin_amount_1");
        },

        margin_amount_1(frm) {
            const { doc } = frm;

            if (!doc.margin_rate_1) {
                return false;
            }

            frm.trigger("calculate_margin_amount_1");

        },

        margin_rate_2(frm) {
            const { doc } = frm;


            if (!doc.margin_rate_2) {
                if (typeof doc.margin_rate_2 == "string") {
                    return false;
                }
            }

            frm.trigger("calculate_margin_amount_2");
        },

        margin_amount_2(frm) {
            const { doc } = frm;

            if (!doc.margin_rate_2) {
                return false;
            }

            frm.trigger("calculate_margin_amount_2");

        },

        sub_total(frm) {
            frm.trigger("calculate_grand_total");
        },

        grand_total(frm) {
            // pass
        },

        calculate_sub_total(frm) {
            frm.call("set_sub_total")
                .then(() => {
                    frm.trigger("calculate_grand_total");
                });
        },

        calculate_rate_per_unit(frm) {
            frm.call("set_rate_per_unit");
        },

        calculate_grand_total(frm) {
            frm.call("set_grand_total")
                .then(() => {
                    frm.trigger("calculate_rate_per_unit");
                });
        },

        calculate_commission_amount(frm) {
            frm.call("set_commission_amount")
                .then(() => {
                    frm.trigger("calculate_sub_total");
                });
        },

        calculate_margin_amount_1(frm) {
            frm.call("set_margin_amount_1")
                .then(() => {
                    frm.trigger("calculate_sub_total");
                });
        },

        calculate_margin_amount_2(frm) {
            frm.call("set_margin_amount_2")
                .then(() => {
                    frm.trigger("calculate_sub_total");
                });
        },

        add_product_assembly_options(frm) {
            const { doc } = frm;

            const { __onload } = doc;

            if (!__onload) {
                return false;
            }

            const { assembly_options, product_assembly } = __onload;
            const { is_compound_product } = product_assembly;

            if (!assembly_options) {
                return false;
            }


            // const product_options = assembly_options.split(", ");

            assembly_options
                .filter(d => d.fixed_qty)
                .map(product_option => {
                    frm.add_child("fixed_costs", product_option);
                });

            assembly_options
                .filter(d => !d.fixed_qty)
                .map(product_option => {
                    frm.add_child("variable_costs", product_option);
                });

            frm.refresh_fields();
        },

        update_valid_until_date(frm) {
            const { doc } = frm;
            const { datetime } = frappe;
            const validity_days = doc.cost_estimation_validity_days;

            if (!doc.generated_on) {
                frm.set_value("generated_on", datetime.nowdate());

                return false;
            }

            const valid_until = datetime
                .add_days(doc.generated_on, validity_days);

            frm.set_value("valid_until", valid_until);
        },

        is_compound_product(frm) {
            frm.set_value("product_assembly", null);
        },
        set_sheets_qty(frm) {
            const { doc } = frm;
            const fieldname = "sheets_qty";

            const { qty_to_produce, units_per_sheet } = doc;
            const value = flt(qty_to_produce) / cint(units_per_sheet);

            frm.set_value(fieldname, value);
        },
        units_per_sheet(frm) {
            const { doc } = frm;

            if (doc.units_per_sheet) {
                frm.trigger("set_sheets_qty");
                frm.trigger("scrap_percentage");
            }
        },
        qty_to_produce(frm) {
            const { doc } = frm;

            if (doc.qty_to_produce) {
                frm.trigger("set_sheets_qty");
                frm.trigger("scrap_percentage");
            }
        },
        scrap_percentage(frm) {
            const { doc } = frm;
            const fieldname = "sheets_to_buy";

            const { sheets_qty, scrap_percentage } = doc;
            const sheets_to_buy = flt(sheets_qty) * flt(scrap_percentage) / 100.000;
            const value = flt(sheets_to_buy) + flt(sheets_qty);

            frm.set_value(fieldname, value);
        },
    };

    frappe.ui.form.on("Cost Estimation", CostEstimation);
})(frappe);