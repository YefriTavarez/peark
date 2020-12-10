frappe.pages['task-center'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __('Task Center'),
        single_column: true
    });

    page.start = 0;

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

    page.project_center_field = page.add_field({
        fieldname: 'project_center',
        label: __('Project Center'),
        fieldtype: 'Link',
        options: 'Project Center',
        change: function () {
            page.task_dashboard.start = 0;
            page.task_dashboard.refresh();
        }
    });

    page.status_field = page.add_field({
        fieldname: 'status',
        label: __('Status'),
        fieldtype: 'Select',
        options: 'Open\nWorking\nPending Review\nOverdue\nCompleted\nCancelled',
        change: function () {
            page.task_dashboard.start = 0;
            page.task_dashboard.refresh();
        }
    });

    page.sort_selector = new frappe.ui.SortSelector({
        parent: page.wrapper.find('.page-form'),
        args: {
            sort_by: 'creation',
            sort_order: 'asc',
            options: [
                { fieldname: 'creation', label: __('Created On') },
                { fieldname: 'modified', label: __('Last Modified') },
                { fieldname: 'status', label: __('Status') },
            ]
        },
        change: function (sort_by, sort_order) {
            page.task_dashboard.sort_by = sort_by;
            page.task_dashboard.sort_order = sort_order;
            page.task_dashboard.start = 0;
            page.task_dashboard.refresh();
        }
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
        }

        page.task_dashboard.refresh();

        // item click
        var setup_click = function (doctype) {
            page.main.on('click', 'a[data-type="' + doctype.toLowerCase() + '"]', function () {
                var name = jQuery(this).attr('data-name');
                var field = page[doctype.toLowerCase() + '_field'];
                if (field.get_value() === name) {
                    frappe.set_route('Form', doctype, name)
                } else {
                    field.set_input(name);
                    page.task_dashboard.refresh();
                }
            });
        }

        // setup_click('Item');
        setup_click('Project');
    };

    frappe.require(asset, callback);
}
