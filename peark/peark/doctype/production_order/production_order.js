// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Production Order', {
    refresh: function (frm) {
        const parent = jQuery("div[data-fieldname=\"operations_display\"]")
            .get(0);

        const { doc } = frm;

        const doctype = "Production Order Ops";
        const meta = frappe.get_meta(doctype);

        const { fields } = meta;
        const with_dashboard = false;

        jQuery.map(doc.operations, operation => {
            // fields.unshift({
            //     fieldtype: 'Section Break',
            //     label: __(operation.product_feature),
            // });

            // const [heading] = layout.sections;
            const [heading] = fields;

            if (heading) {
                heading.label = operation.product_feature;
                // heading.collapsible = 1;
                // heading.make_head();
            }

            const layout = new frappe.ui.form.Layout({
                parent, fields, doctype, with_dashboard, frm
            });

            layout.make();
            // layout.fields_dict["section_break_1"].df.label = operation.product_feature;

            layout.refresh(operation);

        });
    }
});

frappe.ui.form.on('Production Order', {
    product_feature(frm, doctype, name) {
        // const doc = frappe.get_doc(doctype, name);
        // product_feature
        frm.dirty();
    },

    department(frm, doctype, name) {
        // const doc = frappe.get_doc(doctype, name);
        // department
        frm.dirty();
    },

    work_station(frm, doctype, name) {
        // const doc = frappe.get_doc(doctype, name);
        // work_station
        frm.dirty();
    },

    employee(frm, doctype, name) {
        // const doc = frappe.get_doc(doctype, name);
        // employee
        frm.dirty();
    },

    employee_name(frm, doctype, name) {
        // const doc = frappe.get_doc(doctype, name);
        // employee_name
        frm.dirty();
    },

    additional_information(frm, doctype, name) {
        const doc = frappe.get_doc(doctype, name);
        additional_information
    },

});