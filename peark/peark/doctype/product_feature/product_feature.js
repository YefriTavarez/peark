// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on("Product Feature", {
	refresh(frm) {
		frm.trigger("set_queries");
	},

	set_queries(frm) {
		const events = [
			() => frm.trigger("set_query_for_department_1"),
			() => frm.trigger("set_query_for_department_2"),
			() => frm.trigger("set_query_for_department_3"),
			() => frm.trigger("set_query_for_department_4"),
			() => frm.trigger("set_query_for_department_5"),
		];

		frappe.run_serially(events);
	},
	department_1(frm) {
		const { doc } = frm;

		if (doc.department_1) {
			frm.set_value("department_2", null);
			frm.set_value("department", doc.department_1);
		} else {
			frm.set_value("is_group_1", false);
		}
	},

	department_2(frm) {
		const { doc } = frm;

		if (doc.department_2) {
			frm.set_value("department_3", null);
			frm.set_value("department", doc.department_2);
		} else {
			frm.set_value("is_group_2", false);
		}
	},

	department_3(frm) {
		const { doc } = frm;

		if (doc.department_3) {
			frm.set_value("department_4", null);
			frm.set_value("department", doc.department_3);
		} else {
			frm.set_value("is_group_3", false);
		}
	},

	department_4(frm) {
		const { doc } = frm;

		if (doc.department_4) {
			frm.set_value("department_5", null);
			frm.set_value("department", doc.department_4);
		} else {
			frm.set_value("is_group_4", false);
		}
	},

	department_5(frm) {
		const { doc } = frm;

		if (doc.department_5) {
			// frm.set_value("department_6", null);
			frm.set_value("department", doc.department_5);
		} else {
			frm.set_value("is_group_5", false);
		}
	},

	is_group_1(frm) {
		const { doc } = frm;

		// if (doc.is_group_1) {}
		frm.set_value("department_2", null);

	},

	is_group_2(frm) {
		const { doc } = frm;

		// if (doc.is_group_2) {}
		frm.set_value("department_3", null);

	},

	is_group_3(frm) {
		const { doc } = frm;

		// if (doc.is_group_3) {}
		frm.set_value("department_4", null);

	},

	is_group_4(frm) {
		const { doc } = frm;

		// if (doc.is_group_4) {}
		frm.set_value("department_5", null);

	},

	is_group_5(frm) {
		const { doc } = frm;

		if (doc.is_group_5) {
			// frm.set_value("department_6", null);
		}
	},

	set_query_for_department_1(frm) {
		const { doc } = frm;
		const get_query = function () {
			doc.department_0 = "Todos los Departamentos";

			const filters = {
				"parent_department": doc.department_0,
			};

			return { filters };
		};


		frm.set_query("department_1", get_query);
	},

	set_query_for_department_2(frm) {
		const { doc } = frm;
		const get_query = function () {
			const filters = {
				"parent_department": doc.department_1
			};

			return { filters };
		};


		frm.set_query("department_2", get_query);
	},

	set_query_for_department_3(frm) {
		const { doc } = frm;
		const get_query = function () {
			const filters = {
				"parent_department": doc.department_2
			};

			return { filters };
		};


		frm.set_query("department_3", get_query);
	},

	set_query_for_department_4(frm) {
		const { doc } = frm;
		const get_query = function () {
			const filters = {
				"parent_department": doc.department_3
			};

			return { filters };
		};


		frm.set_query("department_4", get_query);
	},

	set_query_for_department_5(frm) {
		const { doc } = frm;
		const get_query = function () {
			const filters = {
				"parent_department": doc.department_4
			};

			return { filters };
		};


		frm.set_query("department_5", get_query);
	},

});