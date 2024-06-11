frappe.ui.form.on("Material Request", {
    refresh(frm) {
        frm.trigger("add_custom_buttons");
    },

    add_custom_buttons(frm) {
        frm.trigger("add_work_order_button");
    },
    
    add_work_order_button(frm) {
        if (frm.doc.docstatus == 0) {
            const label = __("Work Order");
            const fn = () => {
                frm.trigger("work_order_dialog");
            }
            const group = __("Get items from");
    
            frm.add_custom_button(label, fn, group);
        }
    },

    work_order_dialog(frm) {
        const title = __("Get Items from Work Order");
        const fields = [
            {
                label: __("Work Order"),
                fieldname: "work_order",
                fieldtype: "Link",
                options: "Work Order",
                get_query: () => {
                    return {
                        filters: {
                            docstatus: 1,
                            status: "In Process",
                        }
                    };
                },
                reqd: 1
            },
        ];
        const primary_action_label = __("Get Items");
        const primary_action = (values) => {
            const { work_order } = values;

            const method = "peark.controllers.material_request.get_items_from_work_order";
            const args = {
                work_order: work_order,
            }

            const callback = (r) => {
                if (r.message) {
                    const items = r.message;

                    frm.clear_table("items");

                    for (const item of items) {
                        const row = frm.add_child("items");
                        frappe.model.set_value(row.doctype, row.name, "item_code", item.item_code);
                        frappe.model.set_value(row.doctype, row.name, "qty", item.required_qty);
                        frappe.model.set_value(row.doctype, row.name, "for_warehouse", item.source_warehouse);
                    }

                    frm.refresh_field("items");

                    // Set work order in the current material request
                    frm.set_value("work_order", work_order);
                }
            };

            frappe.call({ method, args, callback });

            dialog.hide();
        };

        let dialog = new frappe.ui.Dialog({ 
            title, 
            fields, 
            primary_action_label, 
            primary_action 
        });

        dialog.show();
    },

    update_required_dates(frm) {
        frm.trigger("set_required_dates");
    },

    set_required_dates(frm) {
        const { doc } = frm;

        const schedule_date = doc.schedule_date;
        const fieldname = "schedule_date";

        for (const row of doc.items) {
            frappe.model.set_value(row.doctype, row.name, fieldname, schedule_date);
        }
    },

    set_warehouse(frm) {
        const { doc } = frm;

        for (const row of doc.items) {
            frappe.model.set_value(row.doctype, row.name, "for_warehouse", doc.set_warehouse);
        }
    }
});

frappe.ui.form.on("Material Request Item", {
    item_code(frm, cdt, cdn) {
        frm.trigger("set_warehouse", cdt, cdn);
    },

    set_warehouse(frm, cdt, cdn) {
        const row = locals[cdt][cdn];

        if (row.item_code) {
            const method = "peark.controllers.material_request.get_warehouse";
            const args = {
                user: frappe.session.user,
            };
            const callback = (r) => {
                if (r.message) {
                    console.log(r.message);
                    frappe.model.set_value(cdt, cdn, "warehouse", r.message);
                }
            };
            frappe.call({ method, args, callback });
        }
    }
});