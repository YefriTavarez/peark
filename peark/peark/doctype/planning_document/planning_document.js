// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Planning Document', {
    setup: function (frm) {
        const { wrapper } = frm;

        jQuery(wrapper).on('grid-row-render', (event, grid_row) => {
            if ("Planning Mission" == grid_row.doc.doctype) {
                frm.trigger("should_enable_mission_fields");
            }
        });
    },
    refresh(frm) {
        frappe.run_serially([
            () => frm.trigger("set_queries"),
            () => frm.trigger("should_enable_form"),
            () => frm.trigger("toggle_reqd_sales_order"),
            () => frm.trigger("toggle_reqd_template_planning_fields"),
        ]);
    },
    onload_post_render(frm) {
        const { doc } = frm;

        frappe.run_serially([
            () => {
                // this is just for parent field
                frm.toggle_enable("missions", !doc.planning_template);
            },
        ]);
    },
    set_queries(frm) {
        frappe.run_serially([
            () => frm.trigger("set_item_code_query"),
            () => frm.trigger("set_sales_order_query"),
            () => frm.trigger("set_status_query"),
        ]);
    },
    should_enable_form(frm) {
        const { doc } = frm;
        const {
            model: {
                no_value_type
            },
        } = frappe;

        const bigboss_list = [
            "Projects Manager",
            "System Manager",
            "Administrator"
        ];

        let enable_form = frappe.user.has_role("Projects User")
            && doc.owner != frappe.session.user
            || frappe.user.has_role(bigboss_list);

        const meta = frappe.get_meta(doc.doctype);
        const fields = meta.fields
            .filter(df => !no_value_type.includes(df.fieldtype))
            .filter(df => df.read_only == 0)
            .map(df => df.fieldname);

        // fields.push("missions");

        frm.toggle_enable(fields, enable_form);
    },
    missions_on_form_rendered: function (frm) {
        frm.trigger("should_enable_mission_fields");
    },

    should_enable_mission_fields(frm) {
        const { doc } = frm;
        const {
            model: {
                no_value_type,
            },
        } = frappe;

        const ignore_list = ["status"];

        // let's get our hands dirty
        const missions = frm.get_field("missions");
        const meta = frappe
            .get_meta(missions.df.options);

        jQuery.map(doc.missions, (childdoc) => {
            const { fields } = meta;

            let gridrow = frm.open_grid_row();

            if (!gridrow) {
                gridrow = missions
                    .grid
                    .get_row(childdoc.name);
            }

            if (!gridrow) {
                return false;
            }

            const bigboss_list = [
                "Projects Manager",
                "System Manager",
                "Administrator"
            ];

            let enable_form = frappe.user.has_role("Projects User")
                && doc.owner != frappe.session.user
                || frappe.user.has_role(bigboss_list);

            fields
                .filter(({ fieldname }) => !ignore_list.includes(fieldname))
                .filter(({ fieldtype }) => !no_value_type.includes(fieldtype))
                .map(function (df) {
                    const { fieldname } = df;
                    gridrow.toggle_editable(fieldname, enable_form);
                });
        });
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
    set_status_query(frm) {
        frm.set_query("status", "missions", function (_, cdt, cdn) {
            const doc = frappe.get_doc(cdt, cdn);

            const { __onload } = frm.doc;

            if (!__onload) {
                return {};
            }

            const { planning_template } = __onload;


            if (!planning_template) {
                return {};
            }

            const [mission_template] = planning_template.missions
                .filter(d => d.name == doc.planning_mission_template);

            const options = mission_template
                .possible_status
                .map(d => d.planning_mission_status);
            const filters = {
                name: ["in", options],
            };
            return { filters };
        });
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

        frm.trigger("should_enable_mission_fields");

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
    open_form(frm, cdt, cdn) {
        // const doc = frappe.get_doc(cdt, cdn);
        frappe.set_route("Form", cdt, cdn);
    }
});