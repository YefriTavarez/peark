// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on("Cost Estimation", {
    refresh(frm) {
        frappe.run_serially([
            () => frm.trigger("set_queries"),
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

    set_masks(frm) {
        frappe.run_serially([
            () => frm.trigger("set_commission_rate_mask"),
            // () => frm.trigger("set_qty_to_produce_mask"),
            // () => frm.trigger("set_units_per_sheet_mask"),
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

    comission_amount(frm) {
        const { doc } = frm;

        if (!doc.commission_rate) {
            return false;
        }

        frm.trigger("calculate_commission_amount");

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

        assembly_options.map(product_option => {
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
    }
});