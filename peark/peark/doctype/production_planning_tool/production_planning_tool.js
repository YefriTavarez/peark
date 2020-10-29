// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt
/// field list
/// posting_date = None
/// company = None
/// from_date = None
/// to_date = None
/// sales_order = None
/// item_code = None
/// customer = None
/// planning_documents = list()
/// warehouse = None
/// planning_materials = list()

frappe.ui.form.on('Production Planning Tool', {
    refresh(frm) {
        frappe.run_serially([
            () => frm.trigger("set_queries"),
            () => frappe.timeout(.5),
        ]);
    },
    after_save(frm) {
        frappe.run_serially([
            () => frm.trigger("toggle_display_make_buttons"),
        ]);
    },
    set_queries(frm) {
        frappe.run_serially([
            () => frm.trigger("set_sales_order_query"),
            () => frm.trigger("set_item_code_query"),
        ]);
    },
    set_sales_order_query(frm) {
        const { doc } = frm;
        const fieldname = "sales_order";
        const get_query = function () {
            const { extend } = jQuery;

            let filters = {
                "docstatus": 1,
            };

            if (doc.customer) {
                const __filters = {
                    "customer": doc.customer,
                };

                extend(filters, __filters);
            }

            if (doc.from_date && doc.to_date) {
                const __filters = {
                    "transaction_date": [
                        "Between", [
                            doc.from_date, doc.to_date
                        ]
                    ],
                };

                extend(filters, __filters);
            }

            if (doc.from_date && !doc.to_date) {
                const __filters = {
                    "transaction_date": [">=", doc.from_date],
                };

                extend(filters, __filters);
            }

            if (doc.to_date && !doc.from_date) {
                const __filters = {
                    "transaction_date": ["<=", doc.to_date],
                };

                extend(filters, __filters);
            }

            return { filters };
        };

        frm.set_query(fieldname, get_query);
    },
    set_item_code_query(frm) {
        const { doc } = frm;
        const fieldname = "item_code";
        const get_query = function () {
            let filters = {
                "include_item_in_manufacturing": true,
                "is_sales_item": true,
                "disabled": false,
            };

            if (doc.sales_order_items) {
                jQuery.extend(filters, {
                    "name": ["in", doc.sales_order_items],
                });
            }

            return { filters };
        };

        frm.set_query(fieldname, get_query);
    },
    fetch_sales_order_items(frm) {
        const { db } = frappe;
        const { doc } = frm;

        const doctype = "Sales Order Item";

        const fields = ["item_code"];
        const parent = "Sales Order";

        const args = { parent, fields };
        db.get_list(doctype, args)
            .then(items => {
                const codelist = items
                    .map(d => d.item_code);

                doc.sales_order_items = codelist.join(",");
            });
    },
    clear_sales_order_items(frm) {
        const { doc } = frm;
        delete doc.sales_order_items;
    },

    show_hint_alert(frm) {
        const { doc } = frm;

        if (!frm.is_dirty()) {
            return false;
        }

        const {
            planning_documents,
            planning_materials,
        } = doc;

        if (!planning_documents) {
            doc.planning_documents = new Array();
        }

        if (!planning_materials) {
            doc.planning_materials = new Array();
        }

        if (
            planning_materials
                .every(d => !d.__islocal)

            && planning_documents
                .every(d => !d.__islocal)
        ) {
            return false;
        }

        const msg = __("Save to Continue");

        frappe.run_serially([
            () => frappe.show_alert(msg),
        ]);
    },

    fetch_planning_documents(frm) {
        const { doc } = frm;

        const {
            from_date,
            to_date,
            sales_order,
            item_code,
            customer,
        } = doc;

        const fieldlist = [
            from_date,
            to_date,
            sales_order,
            item_code,
            customer,
        ];

        if (!fieldlist.some(d => d)) {
            const message = [
                __("You didn't specify any filters."),
                __("All Open Planning Documents will be fetched. Continue?"),
            ];

            const ifyes = function () {
                frm.call("on_fetch_planning_documents");
            };

            const ifno = function () {
                const alertmsg = __("No changes made");
                frappe.show_alert(alertmsg);
            };

            frappe.confirm(message.join(" "), ifyes, ifno);

            return false;
        }

        frm.call("on_fetch_planning_documents")
            .then(() => frm.dirty());
    },
    fetch_materials(frm) {
        // const { doc } = frm;
        // const { planning_documents } = doc;

        // const errmsg = __("There should be at least one Planning Document "
        //     + "in the Production Planning Documents' table");

        // if (!planning_documents || !planning_documents.length) {
        //     frappe.throw(errmsg);
        // }

        frappe.run_serially([
            () => frm.call("on_fetch_materials"),
            () => frm.dirty(),
            () => frappe.timeout(2),
            () => frm.trigger("show_hint_alert"),
            () => frm.trigger("toggle_display_make_buttons"), ,
        ]);
    },

    make_material_requests(frm) {
        if (frm.is_dirty()) {
            frm.trigger("show_hint_alert");

            frappe.run_serially([
                () => frm.trigger("show_hint_alert"),
                () => frappe.timeout(.5),
                () => frm.trigger("toggle_display_make_buttons"), ,
            ]);

            return false;
        }

        frm.call("make_material_requests")
            .then((response) => {
                const { show_alert } = frappe;

                const delay = 30;
                const indicator = "green";

                if (!response.message) {
                    const indicator = "red";
                    const message = __("There was an error");

                    show_alert({ message, indicator });

                    return false;
                }

                const doclist = response.message;

                const linklist = doclist.map(d => {
                    return `<a 
                        href=\"/desk#Form/Material Request/${d}\">
                            ${d}
                        </a>`;
                }).join("<br>");

                const message = __(
                    `Material Requests: <br>
                        {0}<br>
                        created succesfully`,
                    [linklist]
                );

                const body = `<table class="table">
                    <tr>
                        <td>
                            <button class="btn btn-link" data-action="view">
                                ${__("View")}
                            </button>
                        </td>
                        <td>
                            <button class="btn btn-link" data-action="submit">
                                ${__("Submit")}
                            </button>
                        </td>
                    </tr>
                </table>`;

                const content = {
                    message,
                    indicator,
                    body,
                };

                const actions = {};

                jQuery.extend(actions, {
                    "view": function (event) {
                        frappe.route_options = {
                            "name": ["in", doclist.join(",")],
                        };
                        frappe.set_route("List", "Material Request", "List");
                    },
                    "submit": function (event) {
                        frappe.call({
                            method: "frappe.desk.doctype.bulk_update.bulk_update.submit_cancel_or_update_docs",
                            args: {
                                doctype: "Material Request",
                                action: "submit",
                                docnames: doclist,
                            },
                            callback: () => {
                                const [view, doctype, name] = frappe.get_route();

                                if (cur_frm && cur_frm.docname == name) {

                                    frappe.run_serially([
                                        () => frappe.timeout(1.5),
                                        () => cur_frm.reload_doc(),
                                    ]);

                                    return false;
                                }

                                frappe.run_serially([
                                    () => frappe.timeout(1.5),
                                    () => actions.view(event),
                                ]);
                            },
                        });
                    },
                });

                show_alert(content, delay, actions);
            });
    },
    make_production_orders(frm) {
        const { doc } = frm;

        const { planning_documents } = doc;
        if (!planning_documents) {
            doc.planning_documents = new Array();
        }

        if (planning_documents.length) {
            frm.call("make_production_orders");

            return true;
        }

        const errmsg = __("You need to have at least one Planning "
            + "Document on the table to continue");

        frappe.throw(errmsg);
    },
    toggle_display_make_buttons(frm) {
        const { doc } = frm;

        const {
            planning_documents,
            planning_materials,
        } = doc;

        const fields = [
            "make_material_requests",
            "make_production_orders",
        ];

        let display = true;

        if (frm.is_new()) {
            console.log("explain: frm.is_new()");
            display = false;
        }

        if (frm.is_dirty()) {
            console.log("explain: frm.is_dirty()");
            display = false;
        }


        if (!planning_documents) {
            doc.planning_documents = new Array();
        }

        if (!planning_materials) {
            doc.planning_materials = new Array();
        }

        if (
            planning_materials
                .some(d => d.__islocal)

            && planning_documents
                .some(d => d.__islocal)
        ) {
            console.log("explain: other");
            display = false;
        }

        frm.toggle_display(fields, display);
    },
    sales_order(frm) {
        const { doc } = frm;

        if (doc.sales_order) {
            frm.trigger("fetch_sales_order_items");
        } else {
            frm.trigger("clear_sales_order_items");
        }
    },
    item_code(frm) {
        const { doc } = frm;

    },
    customer(frm) {
        const { doc } = frm;

    },
    warehouse(frm) {
        const {
            doc: {
                warehouse,
                planning_materials,
            },
        } = frm;

        if (!warehouse) {
            return false;
        }

        if (!planning_materials) {
            return false;
        }

        planning_materials.map(d => d.warehouse = warehouse);

        frm.refresh_field("planning_materials");
    },
});

frappe.ui.form.on("Production Planning Materials", {
    planning_materials_add(frm, doctype, name) {
        const {
            doc: {
                warehouse,
            },
        } = frm;

        if (!warehouse) {
            return false;
        }

        const doc = frappe.get_doc(doctype, name);

        doc.warehouse = warehouse;

        frm.refresh_field("planning_materials");
    },
});
