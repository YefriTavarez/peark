// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt
(function ({ model, db }) {
	const CostEstimationType = {
		setup(frm) {
			frappe.run_serially([
				() => frm.trigger("hide_amount_columns"),
			]);
		},
		hide_amount_columns(frm) {
			const tablenames = [
				"default_fixed_costs",
				"default_variable_costs",
			];

			jQuery.map(tablenames, tablename => {
				const { hide_amount_column } = CostEstimationType;

				hide_amount_column(frm, tablename);
			});
		},
		hide_amount_column(frm, tablename) {
			const docfield = frm
				.get_field(tablename);

			if (!docfield) {
				return false;
			}

			const tablegrid = docfield.grid;

			const fieldname = "amount";
			const display = false;

			if (!tablegrid) {
				return false;
			}

			tablegrid
				.set_column_disp(fieldname, display);
		},
	};

	frappe.ui.form.on('Cost Estimation Type', CostEstimationType);
})(frappe);
