frappe.pages['task-center'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __('Task Center'),
        single_column: true
    });
    const desired_roles = [
        "Projects Manager",
        "System Manager",
        "Administrator"
    ];

    const show_department = frappe.user.has_role(desired_roles);

    page.get_last_status = function () {
        const defval = 'Not Completed';

        const key = "task_center:last_status";

        let last_status;

        last_status = localStorage
            .getItem(key);

        if (!last_status) {
            // last_status = defval;

            localStorage
                .setItem(key, last_status);
        }

        return last_status;
    };

    page.remember_status = function (status) {
        const defval = 'Not Completed';

        const key = "task_center:last_status";

        // if (!status) {
        //     status = defval;
        // }

        localStorage
            .setItem(key, status);
    };

    page.start = 0;

    page.project_center_field = page.add_field({
        fieldname: 'project_center',
        label: __('Project Center'),
        fieldtype: 'Link',
        options: 'Project Center',
        default: !!frappe.route_options ? frappe.route_options?.proyect_center : "",
        change: function () {
            page.task_dashboard.start = 0;
            page.task_dashboard.refresh();
        }
    });

    page.project_field = page.add_field({
        fieldname: 'project',
        label: __('Project'),
        fieldtype: 'Link',
        options: 'Project',
        change: function () {
            page.task_dashboard.start = 0;
            page.task_dashboard.refresh();
        }
    });

    if (show_department){
        page.department_field = page.add_field({
            fieldname: 'department',
            label: __('Department'),
            fieldtype: 'Link',
            options: 'Department',
            change: function () {
                page.task_dashboard.start = 0;
                page.task_dashboard.refresh();
            }
        });
    }

    page.status_field = page.add_field({
        fieldname: 'status',
        label: __('Status'),
        fieldtype: 'Select',
        default: page.get_last_status(),
        options: '\nOpen\nWorking\nPending Review\nOverdue\nCompleted\nCancelled\nNot Completed',
        change: function () {
            page.task_dashboard.start = 0;
            page.task_dashboard.refresh();

            const status = page.status_field.get_value();
            page.remember_status(status);
        }
    });

    page.sort_selector = new frappe.ui.SortSelector({
        parent: page.wrapper.find('.page-form'),
        args: {
            sort_by: 'creation',
            sort_order: 'asc',
            options: [  
                { fieldname: 'creation', label: __('Created On') },
                { fieldname: 'exp_end_date', label: __('End Date') },
                { fieldname: 'modified', label: __('Last Modified') },
                { fieldname: 'status', label: __('Status') },
            ],
        },
        change: function (sort_by, sort_order) {
            page.task_dashboard.sort_by = sort_by;
            page.task_dashboard.sort_order = sort_order;
            page.task_dashboard.start = 0;
            page.task_dashboard.refresh();
        },
    });

    // page.sort_selector.wrapper.css({ 'margin-right': '15px', 'margin-top': '4px' });

    const asset = 'assets/js/task-dashboard.min.js';

    const callback = function () {
        page.task_dashboard = new peark.TaskDashboard({
            parent: page.main,
        });

        page.task_dashboard.before_refresh = function () {
            this.project_center = page.project_center_field.get_value();
            this.status = page.status_field.get_value();
            this.project = page.project_field.get_value();
            this.department = page.department_field?.get_value();
        }

        page.task_dashboard.refresh();

        // item click
        page.main.on('click', 'a[data-type]', function () {
            const doctype = jQuery(this).attr('data-type');
            const name = jQuery(this).attr('data-name');

            const field = page[doctype.toLowerCase() + '_field'];

            if (!field) {
                frappe.set_route('Form', doctype, name);

                return false;
            }

            if (field.get_value() === name) {
                frappe.set_route('Form', doctype, name);
            } else {
                field.set_input(name);
                page.task_dashboard.refresh();
            }
        });
    };

    frappe.require(asset, callback);
}
