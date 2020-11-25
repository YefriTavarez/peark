// Copyright (c) 2020, Yefri Tavarez and contributors
// For license information, please see license.txt

frappe.provide("frappe.utils.project");

frappe.ui.form.on('Project', {
    refresh(frm) {
        frm.trigger("render_tasks");
        frm.trigger("setup_listeners");
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
            frappe
                .utils
                .project
                .render_tasks(project_tasks, parent);
        }
    },
    setup_listeners(frm) {
        jQuery("button[data-action]")
            .click(event => {
                const { target } = event;

                const action = jQuery(target)
                    .attr("data-action");

                const name = jQuery(target)
                    .attr("data-name");

                frappe
                    .utils
                    .project
                    .handle_action(action, name);

                // jQuery(target)
                //     .attr("data-name", action == "close" ? "open" : "close")
                //     .removeClass(action == "close" ? "btn-link" : "btn-link")
                //     .addClass(action == "close" ? "btn-link" : "btn-link")
                //     .html(action == "close" ? __("Open") : __("Close"));

                // jQuery(target)
                //     .parents("tr")
                //     .find("td[data-column=status]")
                //     .html(action == "close" ? __("Completed") : __("Open"));
            });
    }
});

jQuery.extend(frappe.utils.project, {
    get_row_html_template() {
        return `<tr>
            <td data-column="idx" class="text-right">%(idx)s</td>
            <td data-column="subject">
                <a href="#Form/Task/%(name)s">
                    %(subject)s
                </a>
            </td>
            <td data-column="status">%(__status)s</td>
            <td data-column="actions">%(actions)s</td>
        </tr>`;
    },
    get_table_html_template() {
        return `<table class="table table table-bordered">
            <thead>
                <tr>
                    <th>${__("Sr")}</th>
                    <th>${__("Subject")}</th>
                    <th>${__("Status")}</th>
                    <th>${__("Actions")}</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>`;
    },
    clear(parent) {
        jQuery(parent)
            .empty();
    },
    render_tasks(project_tasks, parent) {
        const me = this;
        const html = me.get_table_html_template();

        me.clear(parent);

        const html_table = jQuery(html)
            .appendTo(parent);

        const tablebody = html_table.find("tbody");

        project_tasks.map(function (task) {
            me.render_task(task, tablebody);
        });

        me.html_table = html_table;
    },
    render_task(data, parent) {
        const me = this;
        // const { name, subject, status } = data;

        const row_html_template = me.get_row_html_template();

        // data.status
        data.actions = ``;

        if (data.status != "Open") {
            data.actions =
                `<button
                    type="button"
                    data-action="open"
                    data-name="${data.name}"
                    class="btn btn-link btn-xs"
                >${__("Open")}</button>`;
        } else {
            data.actions =
                `<button
                    type="button"
                    data-action="close"
                    data-name="${data.name}"
                    class="btn btn-link btn-xs"
            >${__("Close")}</button>`;
        }

        data.__status = __(data.status);

        const table_row_template = repl(row_html_template, data);
        const table_row = jQuery(table_row_template)
            .appendTo(parent);

        if (!me.rows) {
            me.rows = new Array();
        }

        me.rows.push(table_row);
    },
    handle_action(action, name) {
        const method = "peark.controllers.erpnext.project.update_task";
        const status = action == "close" ? "Completed" : "Open";

        const args = { status, name };

        const callback = response => {
            if (cur_frm.doc.__unsaved) {
                cur_frm.dashboard.clear_headline();
                cur_frm.dashboard.set_headline_alert(__("This form has been modified after you have loaded it")
                    + '<a class="btn btn-xs btn-link pull-right" onclick="cur_frm.reload_doc()">'
                    + __("Refresh") + '</a>', "alert-warning");
            } else {
                cur_frm.reload_doc();
            }
        };

        frappe.call({ method, args, callback });
    },
});