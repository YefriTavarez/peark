// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.provide("frappe.params");
frappe.ui.form.on('Planning Mission', {
    refresh(frm) {
        frappe.run_serially([
            () => frm.trigger("should_reload_from_db"),
            () => frm.trigger("should_enable_form"),
            () => frm.trigger("enable_fields"),
            () => frm.trigger("show_call_to_action_button"),
        ]);
    },
    should_reload_from_db(frm) {
        const { params } = frappe;

        if (params.should_reload) {
            frm.trigger("reload_from_db");

            delete params.should_reload;
        }
    },
    reload_from_db(frm) {
        const { doc } = frm;

        const { model } = frappe;

        const callback = function () {
            // let's just make sure the form is downloaded
            model.remove_from_locals(doc.doctype, doc.name);

            model.with_doc(doc.doctype, doc.name, () => {
                frm.refresh_fields();
            });
        };


        if (doc.parenttype && doc.parent) {
            model.with_doc(doc.parenttype, doc.parent, callback);
            return false;
        }

        callback();
    },

    show_call_to_action_button(frm) {
        const { doc } = frm;
        const { parse } = JSON;
        const { utils } = frappe;

        const {
            name,
            doctype,
            status,
            status_workflow,
        } = doc;

        const filters = { status };
        const workflows = parse(status_workflow);

        const actions = utils
            .filter_dict(workflows, filters);

        const html_rendered = frappe
            .render_template("actions_template", { actions });

        const wrapper = jQuery(frm.wrapper)
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
    },

    handle_status_change(frm) {
        const { doctype, name } = frm.doc;
        const { db, model } = frappe;

        const fieldname = "status";
        const { status } = frappe.flashvals;

        jQuery.map([db, model], module => {
            module.set_value(doctype, name, fieldname, status);
        });
    },

    enable_fields(frm) {
        frappe.run_serially([
            () => frm.trigger("enable_planning_document"),
            () => frm.trigger("hide_open_form"),
            () => frm.trigger("display_go_to_parent"),
            () => frm.trigger("display_status_workflow"),
            () => frm.refresh_fields(),
        ]);
    },
    enable_planning_document(frm) {
        const fieldname = "planning_document";

        frappe.run_serially([
            () => frm.toggle_display(fieldname, true),
            () => frm.toggle_reqd(fieldname, true),
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

        const ignore_list = ["status"];

        let enable_form = frappe.user.has_role("Projects User")
            && doc.owner != frappe.session.user
            || frappe.user.has_role(bigboss_list);

        const meta = frappe.get_meta(doc.doctype);
        const fields = meta.fields
            .filter(df => !ignore_list.includes(df.fieldname))
            .filter(df => !no_value_type.includes(df.fieldtype))
            .filter(df => df.read_only == 0)
            .map(df => df.fieldname);

        // fields.push("missions");

        frm.toggle_enable(fields, enable_form);
    },
    planning_document(frm) {
        frm.set_value("planning_mission_template", null);
    },
    planning_mission_template(frm) {
        const { doc } = frm;

        if (!doc.planning_mission_template) {
            return false;
        }

        frm.call("load_mission_template")
            .then(response => {
                // todo
            });
    },
    hide_open_form(frm) {
        frm.toggle_display("open_form", false);
    },
    display_status_workflow(frm) {
        const bigboss_list = [
            "System Manager",
            "Administrator"
        ];

        const fieldlist = ["status_workflow"];

        let enable_form = frappe.user.has_role(bigboss_list);

        frm.toggle_display(fieldlist, enable_form);
    },
    display_go_to_parent(frm) {
        frm.toggle_display("go_to_parent", true);
    },
    go_to_parent(frm) {
        const { doc } = frm;

        frappe.set_route("Form", "Planning Document",
            doc.planning_document);
    },
});
