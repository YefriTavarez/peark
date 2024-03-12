// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

(function ({ db, model }) {
    const ProjectCenter = {
        refresh(frm) {
            frappe.run_serially([
                () => frm.trigger("set_queries"),
                () => frm.trigger("add_fetches"),
                () => frm.trigger("setup_projects"),
                () => frm.trigger("setup_attachments"),
                () => frm.trigger("setup_dashboard"),
                () => frm.trigger("add_custom_buttons"),
                () => frm.trigger("toggle_display_fields"),
                () => frm.trigger("toggle_enable_fields"),
                () => frm.trigger("toggle_reqd_fields"),
            ]);
        },
        before_save(frm) {
            // const event = "generated_projects";
            // const callback = () => {
            //     frappe.run_serially([
            //         () => frm.reload_doc(),
            //         () => frappe.dom.unfreeze(),
            //     ]);
            // };
            // frappe.realtime.on(event, callback);
            // if (frm.is_new()) {
            //     frappe.dom.freeze("Cargando los sub-proyectos.");
            // }
        },
        project_center_template(frm) {
            frm.trigger("toggle_reqd_bom");
        },
        add_fetches(frm) {
            frappe.run_serially([
                () => frm.trigger("add_project_center_template_fetch"),
            ]);
        },
        add_custom_buttons(frm) {
            frappe.run_serially([
                () => frm.trigger("add_create_production_order_button"),
            ]);
        },
        setup_projects(frm) {
            const { doc } = frm;
            const { projects } = doc;

            const selector =
                "div[data-fieldtype=HTML][data-fieldname=project_display]";

            const wrapper = jQuery("<div></div>")
                .appendTo(
                    jQuery(selector)
                        .empty()
                );

            frm.cur_project_table = new peark.utils.ProjectTable({
                wrapper,
                frm,
                projects,
            });
        },
        setup_dashboard(frm) {
            const { doc } = frm;

            const { __onload: opts } = doc;

            const selector =
                "div[data-fieldtype=HTML][data-fieldname=dashboard]";

            const wrapper = jQuery("<div></div>")
                .appendTo(
                    jQuery(selector)
                        .empty()
                );

            if (jQuery.isEmptyObject(opts)) {
                return "no dashboard data to display";
            }

            frm.cur_dashboard = new peark.utils.ProjectDashboard({
                wrapper,
                frm,
                opts,
            });

        },
        setup_attachments(frm) {
            const selector = ".sidebar-menu.form-attachments a.add-attachment";

            jQuery(selector)
                .off("click")
                .on("click", function (event) {
                    new peark.utils.FileUploader({
                        doctype: frm.doctype,
                        docname: frm.docname,
                        frm: frm,
                        // folder: 'Home/Attachments/',
                        on_success: (file, opts) => {
                            // console.log({ file, opts });
                            frm.reload_doc();
                        }
                    });
                });
        },
        toggle_display_fields(frm) {
            frappe.run_serially([
                () => frm.trigger("toggle_display_front_pantones_field"),
                () => frm.trigger("toggle_display_back_pantones_field"),
                () => frm.trigger("toggle_display_front_colors_field"),
                () => frm.trigger("toggle_display_back_colors_field"),
            ]);
        },
        toggle_enable_fields(frm) {
            frappe.run_serially([
                () => frm.trigger("toggle_enable_status_field"),
            ]);
        },
        toggle_reqd_fields(frm) {
            frappe.run_serially([
                () => frm.trigger("toggle_reqd_bom"),
            ]);
        },
        toggle_reqd_bom(frm) {
            const { doc } = frm;

            if (doc.project_center_template != "Producto sin manufactura") {
                frm.toggle_reqd("bom", 1);
            } else {
                frm.toggle_reqd("bom", 0);
            }
        },
        toggle_display_front_pantones_field(frm) {
            const { doc } = frm;
            const fieldname = "front_pantones";
            const keyworkds = [
                "Color Pantone Tiro",
                "Colores Pantone Tiro"
            ];

            let display = false;
            let reqd = false;
            keyworkds.map(keyworkd => {
                if (doc.item_specifications.indexOf(keyworkd) !== -1) {
                    display = true;
                    reqd = true;
                }
            });

            frm.toggle_display(fieldname, display);
            // frm.toggle_reqd(fieldname, reqd);
        },
        toggle_display_back_pantones_field(frm) {
            const { doc } = frm;
            const fieldname = "back_pantones";
            const keyworkds = [
                "Color Pantone Retiro",
                "Colores Pantone Retiro"
            ];

            let display = false;
            let reqd = false;
            keyworkds.map(keyworkd => {
                if (doc.item_specifications.indexOf(keyworkd) !== -1) {
                    display = true;
                    reqd = true;
                }
            });

            frm.toggle_display(fieldname, display);
            // frm.toggle_reqd(fieldname, reqd);
        },
        toggle_display_front_colors_field(frm) {
            const { doc } = frm;
            const fieldname = "front_colors";
            const keyworkds = [
                "Color Tiro",
                "Colores Tiro"
            ];

            let display = false;
            let reqd = false;
            keyworkds.map(keyworkd => {
                if (doc.item_specifications.indexOf(keyworkd) !== -1) {
                    display = true;
                    reqd = true;
                }
            });

            frm.toggle_display(fieldname, display);
            // frm.toggle_reqd(fieldname, reqd);
        },
        toggle_display_back_colors_field(frm) {
            const { doc } = frm;
            const fieldname = "back_colors";
            const keyworkds = [
                "Color Retiro",
                "Colores Retiro"
            ];

            let display = false;
            let reqd = false;
            keyworkds.map(keyworkd => {
                if (doc.item_specifications.indexOf(keyworkd) !== -1) {
                    display = true;
                    reqd = true;
                }
            });

            frm.toggle_display(fieldname, display);
            // frm.toggle_reqd(fieldname, reqd);
        },
        toggle_enable_status_field(frm) {
            const allowed_roles = [
                "Sales Manager",
                "Supervisor de Ventas",
            ];

            if (frappe.user.has_role(allowed_roles)) {
                frm.toggle_enable("status", 1);
            }
        },
        set_queries(frm) {
            frappe.run_serially([
                () => frm.trigger("set_sales_order_query"),
                () => frm.trigger("set_item_code_query"),
                () => frm.trigger("set_bom_query")
            ]);
        },
        set_sales_order_query(frm) {
            const { doc } = frm;
            const fieldname = "sales_order";
            const get_query = function () {
                const filters = {
                    "customer": doc.customer,
                };

                return { filters };
            };

            frm.set_query(fieldname, get_query);
        },
        set_item_code_query(frm) {
            const { doc } = frm;
            const fieldname = "item_code";
            const query = ""
            const get_query = function () {
                const filters = {
                    "sales_order": doc.sales_order,
                };

                return { filters };
            };

            frm.set_query(fieldname, get_query);
        },
        add_project_center_template_fetch(frm) {
            const link_field = "project_center_template";
            const source_field = "order_required";
            const target_field = "order_required";

            frm.add_fetch(link_field, source_field, target_field);
        },
        add_create_production_order_button(frm) {
            const { doc } = frm;

            const label = __("Work Order");
            const parent = __("Create");
            const action = _ => {
                const method = "peark.peark.doctype.project_center.project_center.make_work_order";
                const args = {
                    "project_center": frm.docname,
                    "cost_center": frappe.boot.user_info[frappe.session.user].cost_center,
                };

                const callback = function (response) {
                    const viewtype = "Form";
                    const { message } = response;
                    const [doc] = frappe.model.sync(message);

                    frappe.set_route(viewtype, doc.doctype, doc.name);
                };

                frappe.call({ method, args, callback });
            };

            if (frm.is_new()) {
                return "document is new";
            }

            // if (doc.status != "Open") {
            //     return "document is not open";
            // }
            frm.add_custom_button(label, action, parent);
        },
        item_code(frm) {
            const filters = {
                "is_active": 1,
                "docstatus": 1,
                "is_default": 1,
                "item": frm.doc.item_code
            }

            frappe.db.get_value("BOM", filters, "name").then(
                ({ message }) => {
                    cur_frm.set_value("bom", message.name)
                }
            )
        },
        order_required(frm) {
            const { doc } = frm;
            const fieldlist = [
                "customer",
                "sales_order",
                // "product_name",
            ];

            frm.toggle_reqd(fieldlist, doc.order_required);
        },
        item_specifications(frm) {
            frm.trigger("toggle_display_fields");
        },
        set_bom_query(frm) {
            const { doc } = frm;
            const fieldname = "bom";
            const query = ""
            const get_query = function () {
                const filters = {
                    "item": doc.item_code,
                    "docstatus": 1,
                    "is_default": 1,
                    "is_active": 1,
                };

                return { filters };
            };

            frm.set_query(fieldname, get_query);
        }
    };

    frappe.ui.form.on('Project Center', ProjectCenter);
})(frappe);
