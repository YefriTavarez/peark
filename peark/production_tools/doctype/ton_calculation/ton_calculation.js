// Copyright (c) 2021, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt


frappe.ui.form.on('Ton Calculation', {
	refresh: function (frm) {
		// frm.trigger("test");
	},

	onload_post_render: function (frm) {
		frm.trigger("fetch_exchange_rate");
	},

	test: function (frm) {
		console.log("testing");

		// testing weight
		const gsm = 295;
		const width = 24.25;
		const height = 34.75;

		const tonne_rate = 650.000;
		const exchange_rate = 60.000;

		const expected_weight = 160.3821389125;
		const current_weight = Utils.get_current_gsm(width, height, gsm);

		const expected_sheets_per_tonne = 6018.000;
		const current_sheets_per_tonne = Utils.get_sheets_in_tonne(current_weight);


		const expected_rate_per_sheet = 0.11665;
		const rate_per_sheet = Utils.get_rate_per_sheet(tonne_rate, current_sheets_per_tonne);

		const base_rate_per_sheet = flt(rate_per_sheet) * flt(exchange_rate);

		console.log({
			expected_weight,
			current_weight,

			expected_sheets_per_tonne,
			current_sheets_per_tonne,

			expected_rate_per_sheet,
			rate_per_sheet,
			base_rate_per_sheet,
		});
	},

	gsm: function (frm) {
		const { gsm } = frm.doc;
		const opts = {
			message: "GSM is Mandatory",
			indicator: "red",
		};

		if (!gsm) {
			frappe.show_alert(opts);
		} else {
			frm.trigger("handle_gsm_change")
		}
	},

	handle_gsm_change: function (frm) {
		frm.trigger("calculate_rates_and_qty");
	},

	tonne_rate: function (frm) {
		const { tonne_rate } = frm.doc;
		const opts = {
			message: "Precio de Tonelada is Mandatory",
			indicator: "red",
		};

		if (!tonne_rate) {
			frappe.show_alert(opts);
		} else {
			frm.trigger("handle_tonne_rate_change")
		}
	},

	handle_tonne_rate_change: function (frm) {
		frm.trigger("calculate_rates_and_qty");
	},

	exchange_rate: function (frm) {
		const { exchange_rate } = frm.doc;
		const opts = {
			message: "Tasa del Dolar is Mandatory",
			indicator: "red",
		};

		if (!exchange_rate) {
			frappe.show_alert(opts);
		} else {
			frm.trigger("handle_exchange_rate_change")
		}
	},

	handle_exchange_rate_change: function (frm) {
		frm.trigger("calculate_rates_and_qty");
	},

	width: function (frm) {
		const { width } = frm.doc;
		const opts = {
			message: "Ancho is Mandatory",
			indicator: "red",
		};

		if (!width) {
			frappe.show_alert(opts);
		} else {
			frm.trigger("handle_width_change")
		}
	},

	handle_width_change: function (frm) {
		frm.trigger("calculate_rates_and_qty");
	},

	height: function (frm) {
		const { height } = frm.doc;
		const opts = {
			message: "Alto is Mandatory",
			indicator: "red",
		};

		if (!height) {
			frappe.show_alert(opts);
		} else {
			frm.trigger("handle_height_change")
		}
	},

	handle_height_change: function (frm) {
		frm.trigger("calculate_rates_and_qty");
	},

	uom: function (frm) {
		const { uom } = frm.doc;
		const opts = {
			message: "Alto is Mandatory",
			indicator: "red",
		};

		if (!uom) {
			frappe.show_alert(opts);
		} else {
			frm.trigger("handle_uom_change")
		}
	},

	handle_uom_change: function (frm) {
		frm.trigger("calculate_rates_and_qty");
	},

	calculate_rates_and_qty: function (frm) {
		const { doc } = frm;

		const { gsm, uom, tonne_rate, exchange_rate } = doc;

		let { width, height } = doc;

		const req_fields = [gsm, width, height, tonne_rate, exchange_rate];

		if (req_fields.some(d => !d)) {
			doc.qty_in_tonne = 0.000;
			doc.rate_per_sheet = 0.000;
			doc.base_rate_per_sheet = 0.000;

			frm.refresh_fields();

			return 0.000;
		}

		if (uom === "cm") {
			const convert = Utils.conversion_map["cm:in"];

			width = convert(width);
			height = convert(height);
		} else if (uom === "mm") {
			const convert = Utils.conversion_map["mm:in"];

			width = convert(width);
			height = convert(height);
		}

		const current_weight = Utils.get_current_gsm(width, height, gsm);

		const current_sheets_per_tonne = Utils.get_sheets_in_tonne(current_weight);

		const rate_per_sheet = Utils.get_rate_per_sheet(tonne_rate, current_sheets_per_tonne);

		const base_rate_per_sheet = flt(rate_per_sheet) * flt(exchange_rate);

		doc.qty_in_tonne = flt(current_sheets_per_tonne, 0);
		doc.rate_per_sheet = flt(rate_per_sheet, 5);
		doc.base_rate_per_sheet = flt(base_rate_per_sheet, 5);

		frm.refresh_fields();
	},

	fetch_exchange_rate: function (frm) {
		frappe.call({
			method: "erpnext.setup.utils.get_exchange_rate",
			args: {
				from_currency: "USD",
				to_currency: "DOP",
			},
			callback: function (response) {
				const { message } = response;

				if (message) {
					frm.set_value("exchange_rate", flt(message));
				}
			}
		});
	}
});

frappe.ui.form.on('Conversion Table', {
	from_value: function (frm, cdt, cdn) {
		Utils.set_to_value(frm, cdt, cdn);
	},

	from_uom: function (frm, cdt, cdn) {
		Utils.set_to_value(frm, cdt, cdn);
	},

	to_value: function (frm, cdt, cdn) {
		Utils.set_from_value(frm, cdt, cdn);
	},

	to_uom: function (frm, cdt, cdn) {
		Utils.set_from_value(frm, cdt, cdn);
	},

});


const Utils = {
	from_inches_to_meter_square: function (value) {
		const ONE_INCH_IN_METER_SQUARE = 0.00064516;

		return flt(value) * ONE_INCH_IN_METER_SQUARE;
	},

	get_base_area: function (width, height) {
		return flt(width) * flt(height);
	},

	get_current_gsm(width, height, gsm) {
		const area = Utils.get_area(width, height);

		return flt(gsm) * flt(area);
	},

	get_area: function (width, height) {
		const base_area = Utils.get_base_area(width, height);

		return Utils.from_inches_to_meter_square(base_area);
	},

	get_sheets_in_tonne: function (current_weight) {
		const percent = 100.000;
		const scrap_margin = 3.000;
		const safe_weight = flt(percent) - flt(scrap_margin);
		const safe_weight_percentage = flt(safe_weight) / flt(percent);

		const ONE_ML = 995000;

		if (!current_weight) {
			return 0.000;
		}

		return flt(ONE_ML / flt(current_weight)) * flt(safe_weight_percentage);
	},

	get_rate_per_sheet: function (tonne_rate, sheets_per_tonne) {
		const customs_expenses_rate = 0.08;
		const customs_expenses_amount = flt(tonne_rate) * flt(customs_expenses_rate);

		const tonne_rate_with_customs_expenses = flt(tonne_rate) + flt(customs_expenses_amount);

		return flt(tonne_rate_with_customs_expenses) / flt(sheets_per_tonne);
	},

	set_from_value: function (frm, cdt, cdn) {
		const doc = frappe.get_doc(cdt, cdn);

		const key = repl("%(to_uom)s:%(from_uom)s", doc);
		const value = this.conversion_map[key](doc.to_value);
		const fieldname = "from_value";

		frappe.model.set_value(cdt, cdn, fieldname, value);
	},

	set_to_value: function (frm, cdt, cdn) {
		const doc = frappe.get_doc(cdt, cdn);

		const key = repl("%(from_uom)s:%(to_uom)s", doc);
		const value = this.conversion_map[key](doc.from_value);
		const fieldname = "to_value";

		frappe.model.set_value(cdt, cdn, fieldname, value);
	},

	conversion_map: {
		"in:in": (value) => flt(value),
		"cm:cm": (value) => flt(value),
		"mm:mm": (value) => flt(value),
		"m:m": (value) => flt(value),
		"ft:ft": (value) => flt(value),
		"in:ft": (value) => flt(value) / 12.000,
		"cm:in": (value) => flt(value) / 2.54,
		"mm:in": (value) => flt(value) / 25.4,
		"m:cm": (value) => flt(value) * 100.000,
		"m:mm": (value) => flt(value) * 1000.000,
		"ft:m": (value) => flt(value) / 3.28084,
		"in:m": (value) => flt(value) / 39.37,
		"cm:ft": (value) => flt(value) / 30.48,
		"mm:ft": (value) => flt(value) / 304.8,
		"m:in": (value) => flt(value) * 39.37,
		"ft:cm": (value) => flt(value) * 30.48,
		"ft:mm": (value) => flt(value) * 304.8,
		"in:cm": (value) => flt(value) * 2.54,
		"in:mm": (value) => flt(value) * 25.4,
		"cm:m": (value) => flt(value) / 100.000,
		"mm:m": (value) => flt(value) / 1000.000,
		"m:ft": (value) => flt(value) * 3.28084,
		"ft:in": (value) => flt(value) * 12.000,
	}
};
