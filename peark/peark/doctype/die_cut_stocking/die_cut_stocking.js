// Copyright (c) 2021, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.provide("peark.die_cut_stocking");

Object.assign(peark.die_cut_stocking, {
	refresh(frm) {
		frm.trigger("render_display_images");
	},
	render_display_images(frm) {
		// for passing down to utils functions
		const self = peark.die_cut_stocking;

		const { display_image } = self;

		const fields = [
			{
				"source": "standalone_product_image",
				"target": "standalone_product_display",
			},
			{
				"source": "mounted_product_display",
				"target": "mounted_product_image",
			},
		];

		fields.map(({ source, target }) => display_image(self, source, target));
	},

	// utls funcs
	display_image(self, source, target) {
		
	},
});
frappe.ui.form.on('Die Cut Stocking', peark.die_cut_stocking);
