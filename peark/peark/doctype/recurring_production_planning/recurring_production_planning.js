// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt


frappe.ui.form.on("Recurring Production Planning", {
	refresh: function (frm) {
		frm.trigger("update_currency_labels");
	},

	divisa: function (frm) {
		frm.trigger("update_currency_labels");
	},

	update_currency_labels: function (frm) {
		const { doc } = frm;

		if (doc.divisa) {
			frm.set_currency_labels([
				"gastos_de_material",
				"facturacion_total",
				"margen",
			], doc.divisa);

			frm.set_currency_labels([
				"precio_de_compra_del_material",
				"precio_de_compra_unitario_del_material",
				"precio_unitario_de_venta",
				"total_a_facturar",
			], doc.divisa, "detalle");
		}
	},

	calculate_totals: function (frm) {
		frm.call("calculate_totals")
			.then(response => {
				frm.refresh();
			});
	},
});

frappe.ui.form.on("Recurring Production Planning", {
	volumen: function (frm, cdt, cdn) {
		const { script_manager } = frm;

		script_manager
			.trigger("mask_volume_as_integer",
				cdt, cdn);
	},
	mask_volume_as_integer: function (frm, cdt, cdn) {
		const doc = frappe.get_doc(cdt, cdn);

		const formatted_qty = flt(doc.volumen)
			.formatInteger()

		setTimeout(function () {
			doc.volumen = formatted_qty;

			frm.trigger("calculate_totals");
		}, 99);
	},
	unidades_montadas: function (frm, cdt, cdn) {
		frm.trigger("calculate_totals");
	},
	precio_de_compra_del_material: function (frm, cdt, cdn) {
		frm.trigger("calculate_totals");
	},
	precio_unitario_de_venta: function (frm, cdt, cdn) {
		frm.trigger("calculate_totals");
	},
});
