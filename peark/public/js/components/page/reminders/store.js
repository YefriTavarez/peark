frappe.provide("peark.libs");
frappe.provide("peark.page.reminders");

const { Vuex } = peark.libs;

const doctype = "Reminder";

const addMethod = "frappe.client.insert";
const getAllMethod = "frappe.client.get_list";
const updateMethod = "frappe.client.set_value";
const deleteMethod = "frappe.client.delete";

const fields = [
	"name",
	"flag",
	"content",
	"posting_date",
	"due_date",
	"workflow_status",
	"system_status",
	"notes",
];
const state = {
	onlyTodays: false,
	reminders: new Array(),
	statusFilter: "Not Started",
	statusFilters: {
		"Not Started": ["=", "Not Started"],
		"Not Completed": ["!=", "Completed"],
		"Working": ["=", "Working"],
		"Paused": ["=", "Paused"],
		"Completed": ["=", "Completed"],
	},
	lambdaStatusFilters: {
		"Not Started": d => d.workflow_status == "Not Started",
		"Not Completed": d => d.workflow_status !== "Completed",
		"Working": d => d.workflow_status == "Working",
		"Paused": d => d.workflow_status == "Paused",
		"Overdue": d => d.system_status == "Overdue",
		"Completed": d => d.workflow_status == "Completed",
	},
	flagColor: {
		"": "#d1d8dd",
		"Yellow": "#feef72",
		"Red": "#ff5858",
		"Orange": "#ffa00a",
		"Green": "#98d85b",
		"Blue": "#5e64ff",
		"Purple": "#743ee2",
		"Gray": "#f0f4f7",
	}
};

const mutations = {
	add(state, reminder) {
		const doc = frappe.model.get_new_doc(doctype);

		Object.assign(doc, reminder);


		const method = addMethod;
		const args = {
			doc: doc,
		};

		const callback = response => {
			const { message } = response;

			if (message) {
				const { reminders } = state;

				const {
					name,
					flag,
					workflow_status,
					system_status,
					posting_date,
					due_date,
					content,
					notes,
				} = message;

				reminders.unshift({
					name,
					flag,
					workflow_status,
					system_status,
					posting_date,
					due_date,
					content,
					notes,
				});
			}
		};


		const opts = {
			args: args,
			method: method,
			callback: callback,
		};

		frappe.call(opts);

	},
	update(state, updated) {

		// first things first
		updated.system_status = updated.workflow_status === "Completed" ? "Closed" : "Open";

		const method = updateMethod;
		const args = new Object();

		if (updated.name) {
			const { name } = updated;

			const additionsArguments = {
				doctype: doctype,
				name: name,
				fieldname: updated
			};

			Object.assign(args, additionsArguments);
		}

		const callback = response => {
			const { message } = response;

			if (message) {
				const { reminders } = state;

				const {
					name,
					flag,
					workflow_status,
					system_status,
					posting_date,
					due_date,
					content,
					notes,
				} = message;

				reminders
					.filter(reminder => reminder.name === updated.name)
					.map(reminder => {
						Object.assign(reminder, {
							name,
							flag,
							workflow_status,
							system_status,
							posting_date,
							due_date,
							content,
							notes,
						});
					});
			}
		};

		const opts = {
			method: method,
			args: args,
			callback: callback,
		};

		frappe.call(opts);
	},
	delete(state, name) {
		const method = deleteMethod;
		const args = {
			doctype: doctype,
			name: name,
		};


		const callback = response => {
			// const { message } = response;

			// if (typeof message !== "undefined") {
			// 	// todo
			// }

			mutations.initialize(state);
		};

		const opts = {
			method: method,
			args: args,
			callback: callback,
		};

		frappe.call(opts);
	},
	initialize(state) {
		const filters = new Object();

		if (state.onlyTodays) {
			const additionalFilters = {
				"due_date": get_today(),
			};

			Object.assign(filters, additionalFilters);
		}

		// if (state.statusFilter) {
		// 	const statusFilter = state
		// 		.statusFilters[state.statusFilter];

		// 	const additionalFilters = {
		// 		"workflow_status": statusFilter,
		// 	};

		// 	Object.assign(filters, additionalFilters);
		// }

		const args = {
			doctype: doctype,
			fields: fields,
			filters: filters,
			limit_page_length: 0
		};

		const callback = response => {
			const { message } = response;

			if (message) {
				state.reminders = message;
			}
		};

		const opts = {
			method: getAllMethod,
			args: args,
			callback: callback,
		};

		frappe.call(opts);
	},
	switchStatus(state, updated) {
		const toggledStatus = (function (status) {
			return status === "Completed" ? "Not Started" : "Completed";
		})(updated.workflow_status);

		updated.workflow_status = toggledStatus;

		mutations.update(state, updated);
	},
	switchFilter(state, newFilter) {
		state.statusFilter = newFilter;
	}
};

const getters = {
	get(state) {
		return (name) => {
			const [reminder] = state
				.reminders
				.filter(d => d.name == name);

			return reminder;
		};
	}
};

const actions = {
	loadTodos({ commit }) {
		commit("initialize");
	},
	saveTodo({ commit }, newTodo) {
		const todoObject = {
			// name: "",
			// flag: "",
			// workflow_status: "",
			// system_status: "",
			// posting_date: "",
			// due_date: "",
			content: newTodo,
			// notes: "",
		};

		commit("add", todoObject);
	},
	updateTodo({ commit }, todo) {
		commit("update", todo);
	},
	deleteTodo({ commit }, todo) {
		commit("delete", todo.name);
	},
	toggleStatus({ commit }, todo) {
		commit("switchStatus", todo);
	},
	updateFilter({ commit }, newFilter) {
		commit("switchFilter", newFilter);
	}
};

const store = new Vuex.Store({ state, mutations, getters, actions });
export default store;

// enable system wide
peark.page.reminders.store = store;
