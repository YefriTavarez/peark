frappe.ui.form.on("Material Request", {
    refresh(frm) {
        frm.trigger("add_custom_buttons");
        frm.trigger("setup_dashboard");
    },

    add_custom_buttons(frm) {
        frm.trigger("add_work_order_button");
    },

    setup_dashboard(frm) {
        frm.trigger("add_sales_order_section");
        frm.trigger("add_project_center_section");
    },

    add_sales_order_section(frm) {
        const { doc } = frm;
        const dashboard_section = jQuery(
            `div[data-page-route="Form/Material Request"] .form-section.form-dashboard div.col-xs-6`
        ).parent();

        // Delete duplicated sections if they exist
        dashboard_section.find(".custom-sales-order-section").remove();

        const sales_order_element = `<div class="col-xs-6 custom-sales-order-section">    
            <h6>Sales Order</h6>       
            <div class="document-link" data-doctype="Sales Order">     
                <a class="badge-link small sales-order-link" style="cursor: pointer;">Sales Order</a>
                <span class="text-muted small count" style="margin-left: 5px;">0</span> 
                <span class="open-notification hidden" title="Open Sales Order"></span>
                <button class="btn btn-new btn-default btn-xs" data-doctype="Sales Order" style="margin-left: 10px;">
                    <i class="octicon octicon-plus" style="font-size: 12px;"></i>
                </button>
            </div>
        </div>`;

        dashboard_section.append(sales_order_element);

        // Update indicator and add click event
        const sales_order_count = dashboard_section.find(".custom-sales-order-section .count");
        sales_order_count.text(doc.items[0].sales_order ? "1" : "0");
        
        dashboard_section.find(".custom-sales-order-section .sales-order-link").click(function() {
            if (doc.items[0].sales_order) {
                frappe.set_route("Form", "Sales Order", doc.items[0].sales_order);
            }
        });
    },

    add_project_center_section(frm) {
        const { doc } = frm;
        const dashboard_section = jQuery(
            `div[data-page-route="Form/Material Request"] .form-section.form-dashboard div.col-xs-6`
        ).parent();

        // Delete duplicated sections if they exist
        dashboard_section.find(".custom-project-center-section").remove();

        const project_center_element = `<div class="col-xs-6 custom-project-center-section">    
            <h6>Project Center</h6>       
            <div class="document-link" data-doctype="Project Center">     
                <a class="badge-link small project-center-link" style="cursor: pointer;">Project Center</a>
                <span class="text-muted small count" style="margin-left: 5px;">0</span> 
                <span class="open-notification hidden" title="Open Project Center"></span>
                <button class="btn btn-new btn-default btn-xs" data-doctype="Project Center" style="margin-left: 10px;">
                    <i class="octicon octicon-plus" style="font-size: 12px;"></i>
                </button>
            </div>
        </div>`;

        dashboard_section.append(project_center_element);

        // Update indicator and add click event
        const project_center_count = dashboard_section.find(".custom-project-center-section .count");
        project_center_count.text(doc.items[0].project_center ? "1" : "");

        dashboard_section.find(".custom-project-center-section .project-center-link").click(function() {
            if (doc.items[0].project_center) {
                frappe.set_route("Form", "Project Center", doc.items[0].project_center);
            }
        });
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