// Copyright (c) 2020, Yefri Tavarez and contributors
// For license information, please see license.txt

frappe.provide("peark.utils.FileUploader");
frappe.ui.form.on('Project Center', {
	refresh(frm) {
		frm.trigger("setup_attachments");
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