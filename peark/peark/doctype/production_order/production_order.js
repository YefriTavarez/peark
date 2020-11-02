// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.ui.form.on('Production Order', {
    refresh(frm) {
        frappe.run_serially([
            () => frm.trigger("set_queries"),
            () => frm.trigger("render_operations"),
            () => frm.trigger("enable_child_fields"),
        ]);
    },
    before_save(frm) {
        frappe.run_serially([
            () => frm.trigger("clear_production_order"),
        ]);
    },
    clear_production_order(frm) {
        const { doc } = frm;
        const { operations } = doc;

        if (frm.is_new()) {
            operations.map(({ doctype, name }) => {
                const doc = frappe.get_doc(doctype, name);
                doc.production_order = null;

                return doc;
            });
        }
    },
    set_queries(frm) {
        frappe.run_serially([
            () => frm.trigger("set_sales_order_query"),
            () => frm.trigger("set_product_assembly_query"),
        ]);
    },
    set_sales_order_query(frm) {
        const { doc } = frm;
        const fieldname = "sales_order";
        const get_query = () => {
            const filters = {
                "customer": doc.customer,
            };

            return { filters };
        };

        frm.set_query(fieldname, get_query);
    },
    set_product_assembly_query(frm) {
        const { doc } = frm;
        const fieldname = "product_assembly";
        const get_query = () => {
            const filters = {
                "product_profile": doc.product_profile,
            };

            return { filters };
        };

        frm.set_query(fieldname, get_query);
    },

    get_employee_query(frm, doctype, name) {
        const doc = frappe.get_doc(doctype, name);
        let filters = {
            "department": [
                "in", [
                    doc.department, doc.parent_department
                ],
            ],
        };

        if (!doc.department || !doc.parent_department) {
            filters = new Object();
        }

        return { filters };
    },

    get_workstation_query(frm, doctype, name) {
        const doc = frappe.get_doc(doctype, name);
        let filters = {
            "department": [
                "in", [
                    doc.department, doc.parent_department
                ],
            ],
        };

        if (!doc.department || !doc.parent_department) {
            filters = new Object();
        }

        return { filters };
    },

    insert_above(frm) {
        const { doc, events } = frm;
        const { model } = frappe;

        const doctype = "Production Order Ops";
        const parentfield = "operations";

        const childoc = model
            .get_new_doc(doctype, doc, parentfield);


        // position the current on as the first one
        childoc.idx = 0;
        childoc.product_feature = new String();

        const operations = doc.operations
            .map(row => {
                // increase by one
                row.idx++;

                return row;
            })
            .sort(function (prev, next) {
                return cint(prev.idx) - cint(next.idx);
            });


        doc.operations = operations;

        frappe.run_serially([
            () => frm.trigger("render_operations"),
            () => events.prompt_for_product_feature(frm, childoc),
        ]);
    },

    insert_below(frm) {
        const { doc, events } = frm;
        const { model } = frappe;

        const doctype = "Production Order Ops";
        const parentfield = "operations";

        const childoc = model
            .get_new_doc(doctype, doc, parentfield);

        childoc.product_feature = new String();

        frappe.run_serially([
            () => frm.trigger("render_operations"),
            () => events.prompt_for_product_feature(frm, childoc),
        ]);


    },

    switch_view(frm, event, display) {
        const selector =
            "div[data-fieldname=\"operations_display\"] .form-layout";

        const isvisible = jQuery(selector)
            .is(":visible");

        jQuery("div[data-fieldname=\"operations_display\"]")
            .find("a[data-action=insert_above], a[data-action=insert_below]")
            .toggle(!isvisible);

        if (typeof display != "undefined") {
            jQuery(selector)
                .toggle(display);
        } else {
            jQuery(selector)
                .toggle();
        }

        frm.toggle_display("operations", isvisible);

        frm.trigger("enable_child_fields");
    },

    enable_child_fields(frm) {
        const { doc } = frm;

        const docfield = frm.get_field("operations");
        jQuery.map(doc.operations, operation => {
            const { name } = operation;

            const { grid } = docfield;
            let gridrow;
            try {
                gridrow = grid.get_row(name);
            } catch (e) {
                return false;
            }

            const fieldname = "product_feature";
            gridrow.toggle_editable(fieldname, operation.__islocal);
        });
    },


    prompt_for_product_feature(frm, childoc) {
        const { doc } = frm;

        const fields = [
            {
                label: __("Product Feature"),
                fieldtype: "Link",
                fieldname: "product_feature",
                options: "Product Feature",
                reqd: true,
            },
        ];

        const primary_label = __("Update");
        const title = __("Select the Operation");

        const callback = ({ product_feature }) => {
            const doctype = "Product Feature";
            const name = product_feature;
            const fieldname = "department";

            const callback = ({ department }) => {

                childoc.department = department;
                childoc.product_feature = product_feature;

                frappe.db
                    .get_value("Department", department, "parent_department", ({ parent_department }) => {
                        childoc.parent_department = parent_department;
                    });

                frm.trigger("render_operations");
            };

            frappe.db
                .get_value(doctype, name, fieldname, callback);
        };

        frappe.prompt(fields, callback, title, primary_label);
    },
    render_operations(frm) {
        const selector =
            `div[data-fieldname="operations_display"]`;
        const innerselector =
            `${selector} .form-layout`;

        const isvisible = jQuery(innerselector)
            .is(":visible");

        const parent = jQuery(selector)
            .empty()
            .get(0);

        const doctype = "Production Order Ops";
        const meta = frappe.get_meta(doctype);

        const { fields } = meta;
        const with_dashboard = false;

        const { doc, events } = frm;
        const { operations } = doc;

        if (!operations) {
            doc.operations = new Array();
        }

        (() => {
            const selector = "div.dropdown ul>li>a[data-action]";
            const actions_template = frappe
                .render_template("ops_actions_template");

            jQuery(parent)
                .prepend(actions_template);

            jQuery(selector)
                .on("click", event => {
                    // this is critical
                    event.preventDefault();

                    const { target } = event;

                    const action = jQuery(target)
                        .attr("data-action");

                    events[action](frm, event);
                });
        })();

        if (!operations.length) {
            const content = `<div class=\"grid-empty text-center\">
                ${__("No data")}
            </div>`;
            jQuery(content)
                .appendTo(selector);
        }

        jQuery.map(operations, operation => {
            // fields.unshift({
            //     fieldtype: 'Section Break',
            //     label: __(operation.product_feature),
            // });

            const [heading] = fields;


            const bold = label => {
                return `<strong style="font-size: 120%;">${label}</strong>`;
            };

            if (heading) {
                heading.label = bold(
                    `#${operation.idx} ${operation.product_feature}`
                );
            }

            const layout = new frappe.ui.form.Layout({
                parent, fields, doctype, with_dashboard, frm
            });

            layout.make();

            const { employee, work_station } = layout.fields_dict;

            employee.get_query = events.get_employee_query;
            work_station.get_query = events.get_workstation_query;

            layout.refresh(operation);
        });

        const opselector =
            "div[data-fieldtype=Table][data-fieldname=operations]";
        const opstable_visible = jQuery(opselector)
            .is(":visible");


        if (!isvisible && opstable_visible) {
            jQuery(innerselector)
                .hide();
        }
    },
    fetch_item(frm) {
        const { doc } = frm;

        frm.call("set_item")
            .then(() => {
                // frm.trigger("");
            });
    },
    fetch_product_name(frm) {
        const { doc } = frm;

        frm.call("set_product_name")
            .then(() => {
                // frm.trigger("");
            });
    },
    fetch_qty(frm) {
        const { doc } = frm;

        frm.call("set_qty")
            .then(() => {
                // frm.trigger("");
            });
    },
    fetch_customer(frm) {
        const { doc } = frm;

        frm.call("set_customer")
            .then(() => {
                // frm.trigger("");
            });
    },
    fetch_sales_order(frm) {
        const { doc } = frm;

        frm.call("set_sales_order")
            .then(() => {
                // frm.trigger("");
            });
    },
    fetch_product_profile(frm) {
        const { doc } = frm;

        frm.call("set_product_profile")
            .then(() => {
                // frm.trigger("");
            });
    },
    fetch_product_assembly(frm) {
        const { doc } = frm;

        frm.call("set_product_assembly")
            .then(() => {
                // frm.trigger("");
            });
    },
    fetch_operations(frm) {
        const { doc } = frm;

        frm.call("set_operations")
            .then(() => {
                // frm.trigger("");
            });
    },
    product_assembly(frm) {
        frappe.run_serially([
            () => frm.trigger("fetch_item"),
            () => frm.trigger("fetch_operations"),
        ]);
    },
    planning_document(frm) {
        const { events } = frm;
        frappe.run_serially([
            () => frm.trigger("fetch_item"),
            () => frm.trigger("fetch_product_name"),
            () => frm.trigger("fetch_qty"),
            () => frm.trigger("fetch_customer"),
            () => frm.trigger("fetch_sales_order"),
            () => frm.trigger("fetch_product_profile"),
            () => frm.trigger("fetch_product_assembly"),
            () => frm.trigger("fetch_operations"),
            () => events.render_operations(frm),
        ]);
    },
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

    remarks(frm, doctype, name) {
        const doc = frappe.get_doc(doctype, name);
        // remarks
        frm.dirty();
    },

});