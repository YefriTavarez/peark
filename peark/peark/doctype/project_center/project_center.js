// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

(function ({ db, model }) {
    const ProjectCenter = {
        refresh(frm) {
            frappe.run_serially([
                () => frm.trigger("set_queries"),
                () => frm.trigger("add_fetches"),
                () => frm.trigger("setup_indicators"),
            ]);
        },
        after_insert(frm) {
            console.log("after_insert");
        },
        after_save(frm) {
            frappe.run_serially([
                () => frappe.dom.freeze(),
                () => frappe.timeout(1),
                () => frm.reload_doc(),
                () => frappe.dom.unfreeze(),
            ]);
        },
        add_fetches(frm) {
            frappe.run_serially([
                () => frm.trigger("add_project_center_template_fetch"),
            ]);
        },
        add_indicators(frm) {
            const { doc } = frm;
            const { projects } = doc;

            jQuery.map(projects, childdoc => {
                const { name, project, project_template, status } = childdoc;

                const gridrow = frm.get_field("projects").grid;

                const row = gridrow.get_row(name);

                const indicator = status == "Completed" ? "green" : "red";

                jQuery(row.parent)
                    .find(`div[data-fieldname=project] a[data-name=${project}]`)
                    .html(`<strong
                            class="indicator ${indicator}"
                            data-name="${name}"
                        >
                            ${project}: ${project_template}
                        </strong>`);
            });
        },
        setup_indicators(frm) {
            const { doc } = frm;

            doc.__should_refresh = true;
            let interval = setInterval(function () {
                if (!doc.__should_refresh) {
                    return false;
                }

                ProjectCenter
                    .add_indicators(frm);
            }, 500);

            setTimeout(event => {
                doc.__should_refresh = false;
            }, 500);

            jQuery(window)
                .on("hashchange", event => {
                    if (interval) {
                        clearInterval(interval);

                        interval = null;
                    }
                    // don't try this
                    // jQuery(window).off("hashchange");
                });

        },

        set_queries(frm) {
            frappe.run_serially([
                () => frm.trigger("set_sales_order_query"),
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
        add_project_center_template_fetch(frm) {
            const link_field = "project_center_template";
            const source_field = "order_required";
            const target_field = "order_required";

            frm.add_fetch(link_field, source_field, target_field);
        },
        order_required(frm) {
            const { doc } = frm;
            const fieldlist = [
                "customer",
                "sales_order",
                "product_name",
            ];

            frm.toggle_reqd(fieldlist, doc.order_required);
        },
        projects_on_form_rendered(frm) {
            const { doc } = frm;
            doc.__should_refresh = true;
        }
    };

    frappe.ui.form.on('Project Center', ProjectCenter);
})(frappe);
