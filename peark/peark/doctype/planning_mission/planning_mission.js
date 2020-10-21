// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Planning Mission', {
    refresh(frm) {
        frappe.run_serially([
            () => frm.trigger("should_enable_form"),
            () => frm.trigger("enable_fields"),
        ]);
    },
    enable_fields(frm) {
        frappe.run_serially([
            () => frm.trigger("enable_planning_document"),
            () => frm.trigger("hide_open_form"),
            () => frm.trigger("display_go_to_parent"),
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
    display_go_to_parent(frm) {
        frm.toggle_display("go_to_parent", true);
    },
    go_to_parent(frm) {
        const { doc } = frm;

        frappe.set_route("Form", "Planning Document",
            doc.planning_document);
    },
});
