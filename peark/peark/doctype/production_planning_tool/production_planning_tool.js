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
        const msg = __("Save to Continue");

        frappe.run_serially([
            () => frappe.timeout(2),
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

        frm.call("on_fetch_planning_documents");
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
            () => frm.trigger("show_hint_alert"),
        ]);

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
