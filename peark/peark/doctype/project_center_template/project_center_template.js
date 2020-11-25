// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

(function ({ db, model }) {
    const ProjectCenter = {
        refresh(frm) {
            frappe.run_serially([
                () => frm.trigger("add_custom_buttons"),
            ]);
        },
        add_custom_buttons(frm) {
            if (frm.is_new()) {
                return false;
            }

            frappe.run_serially([
                () => frm.trigger("add_create_project_button"),
            ]);
        },
        add_create_project_button(frm) {
            
        },
    };

    frappe.ui.form.on('Project Center', ProjectCenter);
})(frappe);
