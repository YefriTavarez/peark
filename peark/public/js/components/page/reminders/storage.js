export default {
	save(todo) {
		let todos = JSON.parse(
			localStorage
				.getItem(`reminders:${frappe.user.abbr()}:todos`)
		);

		if (!todos) {
			todos = new Array();
		}

		const todoObject = {
			"name": this.hash(),
			"content": todo,
			"status": "Not Started",
			"duedate": get_today(),
			// "posting_date": get_today(),
			"closed": false,
		};

		todos.unshift(todoObject);

		localStorage
			.setItem(`reminders:${frappe.user.abbr()}:todos`,
				JSON.stringify(todos));

		return todoObject;
	},

	update(updated, todos) {
		todos.filter(d => d.name == updated.name)
			.map(d => {
				jQuery.extend(d, updated);
			});

		localStorage
			.setItem(`reminders:${frappe.user.abbr()}:todos`,
				JSON.stringify(todos));
	},

	all() {
		let todos = JSON.parse(
			localStorage
				.getItem(`reminders:${frappe.user.abbr()}:todos`)
		);

		if (!todos) {
			todos = [];
		}

		return todos;
	},

	clear() {
		localStorage
			.setItem(`reminders:${frappe.user.abbr()}:todos`,
				JSON.stringify([]));
	},

	hash() {
		const length = 50;
		const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".match(/./g);
		let result = "";

		for (let i = 0; i < length; i++) {
			result += charset[Math.floor(Math.random() * charset.length)];
		}
		return result;
	}
};