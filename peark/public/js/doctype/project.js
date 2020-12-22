// Copyright (c) 2020, Yefri Tavarez and contributors
// For license information, please see license.txt

frappe.ui.form.on('Project', {
    refresh(frm) {
        frm.trigger("render_tasks");
    },
    render_tasks(frm) {
        const { doc } = frm;

        let project_tasks = null;
        const parent = frm.fields_dict.tasks.$wrapper;

        if (frm.is_new()) {
            return false;
        }

        if (doc.__onload) {
            project_tasks = doc.__onload["project_tasks"];
        }

        if (project_tasks) {
            const wrapper = jQuery("<div class=\"task-wrapper\"></div>")
                .appendTo(
                    jQuery(parent)
                        .empty()
                );

            frm.cur_task_list = new frappe.ui.TaskList({
                wrapper: wrapper,
                tasks: project_tasks,
                frm: frm,
            });
        }
    },
});
