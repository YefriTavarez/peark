// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Planning Template', {
    refresh(frm) {
        frappe.run_serially([
            () => frm.trigger("set_queries"),
            () => frm.trigger("add_custom_buttons"),
            () => frm.trigger("fetch_child_docfields"),
        ]);
    },
    set_queries(frm) {
        frappe.run_serially([
            () => frm.trigger("set_cost_center_query"),
            () => frm.trigger("set_planning_mission_subject_query"),
        ]);
    },
    add_custom_buttons(frm) {
        frappe.run_serially([
            () => frm.trigger("add_make_planning_documnt_button"),
        ]);
    },
    fetch_child_docfields(frm) {
        frappe.run_serially([
            () => frm.trigger("fetch_status_multiselect"),
            () => frm.trigger("fetch_depends_on_multiselect"),
        ]);
    },
    set_cost_center_query(frm) {
        const { doc } = frm;
        const fieldname = "cost_center";
        const get_query = function () {

            const filters = {
                "company": doc.company,
            };

            return { filters };
        };

        frm.set_query(fieldname, get_query);
    },
    set_planning_mission_subject_query(frm) {
        const { doc } = frm;

        const fieldname = "subject";
        const parentfield = "missions";

        const get_query = function (frm, cdt, cdn) {
            const { missions } = doc;

            const childdoc = frappe.get_doc(cdt, cdn);

            const ignore_list = missions
                .filter(d => d.subject != childdoc.subject)
                .map(function (d) {
                    return d.subject;
                });

            const filters = {
                "name": ["not in", ignore_list],
            };

            return { filters };
        };

        frm.set_query(fieldname, parentfield, get_query);
    },
    add_make_planning_documnt_button(frm) {
        const parent = __("Make");
        const label = __("Planning Document");

        const action = event => {
            frm.trigger("handle_make_planning_document");
        };

        frm.add_custom_button(label, action, parent);
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
    handle_make_planning_document(frm) {
        const { doc } = frm;
        const { model } = frappe;

        frm.call("make_planning_document")
            .then(({ message }) => {
                if (message) {
                    const [doc] = model.sync(message);

                    frappe.set_route("Form",
                        doc.doctype, doc.name);
                }
            });
    },
});


frappe.provide("frappe.params");
frappe.ui.form.on('Planning Mission Template', {
    open_form(frm, cdt, cdn) {
        const view = "Form";

        frappe.params.should_reload = true;

        frappe.set_route(view, cdt, cdn);
    },
});