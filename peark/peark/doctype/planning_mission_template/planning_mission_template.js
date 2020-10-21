// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.provide("peark.planning_mission_template");

frappe.ui.form.on('Planning Mission Template', {
    refresh(frm) {
        frappe.run_serially([
            () => frm.trigger("set_queries"),
            () => frm.trigger("enable_fields"),
            () => frappe.timeout(1),
            () => frm.trigger("reload_from_db"),
        ]);
    },
    reload_from_db(frm) {
        const { doc } = frm;

        // todo: better this situation to prevent data loss
        // system delays and overloads
        if (doc.possible_status.length) {
            return false;
        }

        const { model } = frappe;

        const callback = function () {
            // let's just make sure the form is downloaded
            model.remove_from_locals(doc.doctype, doc.name);

            model.with_doc(doc.doctype, doc.name, () => {
                frm.refresh_fields();
            });
        }


        if (doc.parenttype && doc.parent) {
            model.with_doc(doc.parenttype, doc.parent, callback);
            return false;
        }

        callback();
    },
    set_queries(frm) {
        frappe.run_serially([
            () => frm.trigger("set_depends_on_query"),
        ]);
    },
    enable_fields(frm) {
        frappe.run_serially([
            () => frm.trigger("enable_planning_template"),
            () => frm.trigger("enable_depends_on"),
            () => frm.trigger("enable_data_to_ask_on"),
            () => frm.trigger("enable_possible_status"),
            () => frm.trigger("hide_open_form"),
            () => frm.trigger("display_go_to_planning_template"),
            () => frm.refresh_fields(),
        ]);
    },
    set_depends_on_query(frm) {
        const { doc } = frm;
        const fieldname = "depends_on";
        const get_query = event => {
            const { depends_on } = doc;

            const ignore_list = depends_on
                .map(d => d.planning_mission_template);

            ignore_list.push(doc.name);

            const filters = {
                name: ["not in", ignore_list],
                planning_template: doc.planning_template,
                idx: ["<", doc.idx],
            };

            return { filters };
        };

        frm.set_query(fieldname, get_query);
    },
    enable_planning_template(frm) {
        const fieldname = "planning_template";

        frappe.run_serially([
            () => frm.toggle_display(fieldname, true),
            () => frm.toggle_reqd(fieldname, true),
        ]);
    },
    enable_depends_on(frm) {
        frm.toggle_display("depends_on", true);
    },
    enable_data_to_ask_on(frm) {
        frm.toggle_display("data_to_ask", true);
    },
    enable_possible_status(frm) {
        frm.toggle_display("possible_status", true);
    },
    fetch_child_docfields(frm) {
        frappe.run_serially([
            () => frm.trigger("fetch_status_multiselect"),
            () => frm.trigger("fetch_depends_on_multiselect"),
        ]);
    },
    fetch_status_multiselect(frm) {
        const doctype = "Possible Planning Mission Status";
        const { model } = frappe;

        model.with_doctype(doctype);
    },
    fetch_depends_on_multiselect(frm) {
        const doctype = "Planning Mission Templates";
        const { model } = frappe;

        model.with_doctype(doctype);
    },
    hide_open_form(frm) {
        frm.toggle_display("open_form", false);
    },
    display_go_to_planning_template(frm) {
        frm.toggle_display("go_to_planning_template", true);
    },
    go_to_planning_template(frm) {
        const { doc } = frm;

        frappe.set_route("Form", "Planning Template",
            doc.planning_template);
    },
});