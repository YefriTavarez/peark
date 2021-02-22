frappe.provide('peark');

peark.TaskDashboard = Class.extend({
	init: function (opts) {
		jQuery.extend(this, opts);
		this.make();
	},
	make: function () {
		var me = this;
		this.start = 0;
		if (!this.sort_by) {
			this.sort_by = 'creation';
			this.sort_order = 'asc';
		}

		this.content = jQuery(frappe.render_template('task_dashboard')).appendTo(this.parent);
		this.result = this.content.find('.result');

		// more
		this.content.find('.btn-more').on('click', function () {
			me.start += 20;
			me.refresh();
		});
	},
	refresh: function () {
		if (this.before_refresh) {
			this.before_refresh();
		}

		var me = this;
		frappe.call({
			method: 'peark.dashboard.task_dashboard.get_data',
			args: {
				project: this.project,
				status: this.status,
				project_center: this.project_center,
				start: this.start,
				sort_by: this.sort_by,
				sort_order: this.sort_order,
			},
			callback: function (r) {
				me.render(r.message);
			}
		});
	},
	render: function (data) {
		if (this.start === 0) {
			this.max_count = 0;
			this.result.empty();
		}

		var context = this.get_task_dashboard_data(data, this.max_count, true);

		// show more button
		if (data && data.length === 21) {
			this.content.find('.more').removeClass('hidden');

			// remove the last element
			data.splice(-1);
		} else {
			this.content.find('.more').addClass('hidden');
		}

		// If not any stock in any warehouses provide a message to end user
		if (context.data.length > 0) {
			jQuery(frappe.render_template('task_dashboard_list', context)).appendTo(this.result);
		} else {
			var message = __("Not found Task")
			jQuery("<span class='text-muted small'>" + message + "</span>").appendTo(this.result);
		}

		this.setup_click(this.result);
	},
	get_task_dashboard_data: function (data, max_count, show_item) {
		if (!max_count) max_count = 0;
		if (!data) data = [];


		var can_write = 0;
		if (frappe.boot.user.can_write.indexOf("Task") >= 0) {
			can_write = 1;
		}

		const desired_roles = [
			"Projects Manager",
			"System Manager",
			"Administrator"
		];

		const show_department = frappe.user.has_role(desired_roles);

		return {
			data: data,
			max_count: max_count,
			can_write: can_write,
			show_department: show_department || false,
		}
	},
	setup_click(parent) {
		const self = this;

		jQuery(parent)
			.find("i[data-action]")
			.click(function (event) {
				const doctype = jQuery(this)
					.attr("data-doctype");

				const name = jQuery(this)
					.attr("data-name");

				const action = jQuery(this)
					.attr("data-action");

				const method = "peark.controllers.task_center.toggle_task_status";
				const args = {
					doctype, name, action
				};

				const callback = function (response) {
					self.refresh();
				};

				frappe.call({ method, args, callback });
			});
		jQuery(parent)
			.find(".indicator > .fa.fa-window-restore")
			.click(event => {
				const { target } = event;

				const data_type = jQuery(target)
					.attr("data-type");

				const data_name = jQuery(target)
					.attr("data-name");

				const url = frappe.urllib.get_full_url(`desk/#Form/${data_type}/${data_name}`);
				window.open(url, "_blank");
			});
	}
});