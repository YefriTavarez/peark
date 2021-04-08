// Copyright (c) 2020, Yefri Tavarez and contributors
// For license information, please see license.txt

frappe.provide("peark.utils");
frappe.ui.form.on('Project Center', {
	refresh(frm) {
		frappe.run_serially([
			frm.trigger("setup_projects"),
			frm.trigger("setup_attachments"),
			frm.trigger("setup_dashboard"),
		]);
	},
	setup_dashboard(frm) {
		const { doc } = frm;

		const { __onload: opts } = doc;

		const selector =
			"div[data-fieldtype=HTML][data-fieldname=dashboard]";

		const wrapper = jQuery("<div></div>")
			.appendTo(
				jQuery(selector)
					.empty()
			);

		if (jQuery.isEmptyObject(opts)) {
			return "no dashboard data to display";
		}

		frm.cur_dashboard = new peark.utils.ProjectDashboard({
			wrapper,
			frm,
			opts,
		});

	},
	setup_projects(frm) {
		const { doc } = frm;
		const { projects } = doc;

		const selector =
			"div[data-fieldtype=HTML][data-fieldname=project_display]";

		const wrapper = jQuery("<div></div>")
			.appendTo(
				jQuery(selector)
					.empty()
			);

		frm.cur_project_table = new peark.utils.ProjectTable({
			wrapper,
			frm,
			projects,
		});
	},
	setup_attachments(frm) {
		const selector = ".sidebar-menu.form-attachments a.add-attachment";

		jQuery(selector)
			.off("click")
			.on("click", function (event) {
				new peark.utils.FileUploader({
					doctype: frm.doctype,
					docname: frm.docname,
					frm: frm,
					// folder: 'Home/Attachments/',
					on_success: (file, opts) => {
						// console.log({ file, opts });
						frm.reload_doc();
					}
				});
			});
	},
});