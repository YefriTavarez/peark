// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

(function ({ model, db }) {

    const ListofMaterial = {
        refresh(frm) {
            ListofMaterial
                .do_conversion_from_fields(frm);
        },

        before_save(frm) {
            ListofMaterial
                .do_conversion_of_fields(frm);
        },

        after_save(frm) {
            frm.refresh();
        },

        do_conversion_of_fields(frm) {
            const { doc } = frm;
            const { items } = doc;

            doc.item_set = new Array();

            items.map(child => {
                const { name } = child;
                const fieldname = `item_set_${name}`;

                let values = doc[fieldname];

                if (!values) {
                    values = new Array();
                }

                const list_of_material_detail = name;

                values.map(value => {
                    const { item } = value;

                    frm.add_child("item_set", {
                        item, list_of_material_detail
                    });
                });

                // finally
                doc[fieldname] = undefined;
            });

            frm.refresh_fields();
        },

        do_conversion_from_fields(frm) {
            const { doc } = frm;
            const { item_set } = doc;

            item_set.map(child => {
                const { list_of_material_detail } = child;
                const fieldname = `item_set_${list_of_material_detail}`;

                doc[fieldname] = new Array();

                return child;
            }).map(child => {
                const { list_of_material_detail } = child;
                const fieldname = `item_set_${list_of_material_detail}`;

                const values = doc[fieldname];


                const { item } = child;
                values.push({ item });
            });
        },
    };

    const ListofMaterialDetail = {
        init() {
            this.with_item_set();
        },

        form_render(frm, doctype, name) {
            ListofMaterialDetail
                .add_item_set_multiselect_field(frm, doctype, name);

            ListofMaterialDetail
                .toggle_reqd_item_set_fields(frm, doctype, name);
        },

        before_items_remove(frm, doctype, name) {
            ListofMaterialDetail
                .sanitize_doc_on_row_deletion(frm, doctype, name);
        },
        sanitize_doc_on_row_deletion(frm, doctype, name) {
            const { doc } = frm;
            const fieldname = `item_set_${name}`;

            let values = doc.item_set;

            if (!values) {
                values = new Array();
            }

            values.filter(childoc => {
                return childoc.list_of_material_detail != name;
            });

            doc.item_set = new Array();

            values.map(value => {
                const { item, list_of_material_detail } = value;

                frm.add_child("item_set", {
                    item, list_of_material_detail
                });
            });

            // finally
            doc[fieldname] = undefined;
        },

        add_item_set_multiselect_field(frm, doctype, name) {
            const doc = frappe.get_doc(doctype, name);

            const gridrow = frm.open_grid_row();
            const displayfield = gridrow.get_field("item_set_display");
            const parent = displayfield.$wrapper;

            if (doc.__islocal) {
                const html = `
                    <label
                        class="control-label"
                        style="padding-right: 0px;"
                    >
                        ${__("Save to Continue")}
                    </label>
                `;

                jQuery(parent).html(html);
                return false;
            }

            const fieldname = `item_set_${doc.name}`;

            frappe.ui.form.make_control({
                df: {
                    fieldtype: "Table MultiSelect",
                    options: "Item Set",
                    fieldname: fieldname,
                    label: __("Item Set"),
                    change: () => {
                        const { item_set } = frm.doc;

                        if (!item_set) {
                            item_set = new Array();
                        }

                        const last_index = item_set.length - 1;

                        if (last_index < 0) {
                            // forget it
                            return false;
                        }

                        const current_set = item_set[last_index];
                        current_set.list_of_material_detail = doc.name;

                        this.add_to_locals(current_set);
                        frm.refresh_fields();
                    },
                    get_query: function () {
                        let item_set = frm.doc[fieldname];

                        if (!item_set) {
                            item_set = new Array();
                        }

                        const selected_items = item_set.map(d => d.item);

                        const filters = {
                            "name": ["not in", selected_items]
                        };

                        return { filters };
                    }
                },
                render_input: true,
                parent: parent.empty(),
                doc: frm.doc
            });
        },

        with_item_set() {
            const doctype = "Item Set";
            const callback = (response) => {
                // pass
            };

            model.with_doctype(doctype, callback);
        },

        add_to_locals(doc) {
            const { doctype, name } = doc;
            if (!locals[doctype]) {
                locals[doctype] = new Object();
            }

            locals[doctype][name] = doc;
        },

        last_purchase_rate_based_on(frm, doctype, name) {
            const doc = frappe.get_doc(doctype, name);
            const fieldname = `item_set_${doc.name}`;

            // clear dependant fields
            doc.item_group = null;
            doc.item = null;

            frm.doc[fieldname] = null;

            ListofMaterialDetail
                .add_item_set_multiselect_field(frm, doctype, name);

            ListofMaterialDetail
                .toggle_reqd_item_set_fields(frm, doctype, name);
        },

        toggle_reqd_item_set_fields(frm, doctype, name) {
            const doc = frappe.get_doc(doctype, name);

            const gridrow = frm.open_grid_row();

            const item_field = gridrow.get_field("item");
            const item_group_field = gridrow.get_field("item_group");

            if (doc.last_purchase_rate_based_on == "Item") {
                item_field.set_mandatory(true);
                item_group_field.set_mandatory(false);
            } else if (doc.last_purchase_rate_based_on == "Item Group") {
                item_field.set_mandatory(false);
                item_group_field.set_mandatory(true);
            } else {
                item_field.set_mandatory(false);
                item_group_field.set_mandatory(false);
            }
        },
    };

    frappe.ui.form.on('List of Material', ListofMaterial);
    frappe.ui.form.on("List of Material Detail", ListofMaterialDetail);
})(frappe);