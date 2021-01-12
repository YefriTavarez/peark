frappe.provide("peark.page.reminders");

frappe.pages['reminders'].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Reminders'),
		single_column: true
	});

	const asset = [
		"assets/js/vuex.min.js",
		"assets/js/reminders.min.js",
	];

	const callback = response => {
		// comes from reminders.min.js
		const { App, store } = peark.page.reminders;

		const el = page.main
			.get(0);

		const render = h => h(App);

		peark.page.reminders.app = new Vue({ el, store, render });
	};

	frappe.require(asset, callback);
};

// frappe.call({
// 	method: "frappe.desk.reportview.get",
// 	args: {
// 		doctype: "Reminder",
// 		fields: ["`tabReminder`.`name`", "`tabReminder`.`owner`", "`tabReminder`.`creation`", "`tabReminder`.`modified`", "`tabReminder`.`modified_by`", "`tabReminder`.`_user_tags`", "`tabReminder`.`_comments`", "`tabReminder`.`_assign`", "`tabReminder`.`_liked_by`", "`tabReminder`.`docstatus`", "`tabReminder`.`parent`", "`tabReminder`.`parenttype`", "`tabReminder`.`parentfield`", "`tabReminder`.`idx`", "`tabReminder`.`content`", "`tabReminder`.`posting_date`", "`tabReminder`.`workflow_status`"],
// 		filters: [],
// 		order_by: "`tabReminder`.`modified` desc",
// 		start: 0,
// 		page_length: 20,
// 		view: "List",
// 		with_comment_count: true
// 	},
// 	callback: ({ message }) => {
// 		console.log({ message });
// 	},

// });