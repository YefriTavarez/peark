// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.provide("frappe.params");
frappe.provide("frappe.flashvals");
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
            () => frm.trigger("remember_status"),
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
    remember_status(frm) {
        const { doc } = frm;
        doc.__previous_status = doc.status;
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
    },
    missions_on_form_rendered(frm) {
        const { doc } = frm;
        const { parse } = JSON;
        const { utils } = frappe;

        jQuery.map(doc.missions, childdoc => {
            const {
                name,
                doctype,
                parentfield,
                status,
                status_workflow,
            } = childdoc;

            const { grid } = frm.get_field(parentfield);
            const gridrow = grid.get_row(name);

            const filters = { status };
            const workflows = parse(status_workflow);

            const actions = utils
                .filter_dict(workflows, filters);

            const html_rendered = frappe
                .render_template("actions_template", { actions });

            const wrapper = jQuery(gridrow.wrapper)
                .find("div[data-fieldname=actions]");

            // remove any child
            wrapper.empty();

            const htmlobj = jQuery(html_rendered)
                .appendTo(wrapper);

            jQuery(htmlobj)
                .find("li>a")
                .on("click", event => {
                    event.preventDefault();

                    const { target } = event;

                    const status = jQuery(target)
                        .attr("data-next-status");

                    jQuery.extend(frappe.flashvals, { status });

                    const event_name = "handle_status_change";

                    frm.script_manager
                        .trigger(event_name, doctype, name);

                    frappe.run_serially([
                        () => frappe.timeout(.5),
                        () => frm.trigger("missions_on_form_rendered"),
                    ]);
                });
        });
    },
    status(frm) {
        const { doc } = frm;
        const { __previous_status, status } = doc;

        const status_list = [
            "Stopped",
            "Paused",
            "Cancelled",
        ];

        if (!__previous_status) {
            console.log("!__previous_status");
            return false;
        }

        if (status_list.includes(__previous_status)) {
            console.log("!status_list.includes(__previous_status)");
            return false;
        }

        if (!status_list.includes(status)) {
            console.log("!status_list.includes(status)");
            return false;
        }

        const message = __("If you change the status of the "
            + "Planning Document to <strong>%(status)s</strong>, all the "
            + "non-completed missions will be set to this status as well. "
            + "Are you sure you want to continue?");

        const ifyes = () => {
            const { db } = frappe;
            const { doctype, name } = doc;

            const fieldname = "status";

            const callback = response => {
                frm.reload_doc();
            };

            db
                .set_value(doctype, name, fieldname, status, callback);
        };

        const ifno = () => {
            doc.status = doc.__previous_status;
            frm.refresh_fields();

            const alertmsg = __("No changes made");

            frappe.show_alert(alertmsg);
        };

        const opts = { "status": __(status) };

        frappe.confirm(
            repl(message, opts), ifyes, ifno);
    }
});

frappe.ui.form.on('Planning Mission', {
    open_form(frm, doctype, name) {
        const view = "Form";

        frappe.params.should_reload = true;

        frappe.set_route(view, doctype, name);
    },
    handle_status_change(frm, doctype, name) {
        const { db, model } = frappe;

        const fieldname = "status";
        const { status } = frappe.flashvals;

        jQuery.map([db, model], module => {
            module.set_value(doctype, name, fieldname, status);
        });
    },
});