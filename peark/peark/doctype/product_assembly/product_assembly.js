// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.provide("frappe.events.product_assembly");
frappe.ui.form.on('Product Assembly', {
    refresh(frm) {
        frappe.run_serially([
            () => frm.trigger("add_custom_buttons"),
            () => frm.trigger("set_custom_queries"),
            () => frm.trigger("toggle_display_fields"),
        ]);
    },

    onload_post_render(frm) {
        frm.trigger("set_color_masks");
    },

    set_custom_queries(frm) {
        const { doc } = frm;

        if (!doc.product_profile) {
            return false;
        }

        frappe.run_serially([
            () => frm.trigger("set_item_group_1_query"), ,
            () => frm.trigger("set_item_group_2_query"), ,
            () => frm.trigger("set_item_group_3_query"), ,
            () => frm.trigger("set_item_group_4_query"), ,
            () => frm.trigger("set_dimension_query"),
            () => frm.trigger("set_paperboard_query"),
            () => frm.trigger("set_backboard_query"),
            () => frm.trigger("set_printing_query"),
            () => frm.trigger("set_control_query"),
            () => frm.trigger("set_cutting_query"),
            () => frm.trigger("set_gluing_query"),
            () => frm.trigger("set_folding_query"),
            () => frm.trigger("set_protection_query"),
            () => frm.trigger("set_utils_query"),
            () => frm.trigger("set_texture_query"),
        ]);
    },

    add_custom_buttons(frm) {

        if (frm.is_new()) {
            frappe.run_serially([
                () => frm.trigger("add_reload_product_profile_button"),
            ]);

            return false;
        }

        frappe.run_serially([
            () => frm.trigger("add_view_items_button"),
        ]);
    },
    set_item_group_1_query(frm) {
        const { root_item_group } = frappe.boot;

        frm.set_query("item_group_1", {
            filters: {
                "parent_item_group": root_item_group,
            },
        });
    },

    set_item_group_2_query(frm) {
        frm.set_query("item_group_2", doc => {
            return {
                filters: {
                    "parent_item_group": doc.item_group_1,
                }
            }
        });
    },

    set_item_group_3_query(frm) {
        frm.set_query("item_group_3", doc => {
            return {
                filters: {
                    "parent_item_group": doc.item_group_2,
                }
            }
        });
    },

    set_item_group_4_query(frm) {
        frm.set_query("item_group_4", doc => {
            return {
                filters: {
                    "parent_item_group": doc.item_group_3,
                }
            }
        });
    },

    set_dimension_query(frm) {
        const query = () => {
            const {
                doc: {
                    __onload = {}
                }
            } = frm;
            const product_profile_doc = __onload.product_profile_doc || {};

            const dimensions = jQuery
                .map(product_profile_doc.dimensions, d => d.dimension);

            const filters = {
                name: ["in", dimensions.join(",")],
            };
            return { filters };
        };

        frm.set_query("dimension", query);
    },

    set_paperboard_query(frm) {
        const query = () => {
            const {
                doc: {
                    __onload = {}
                }
            } = frm;
            const product_profile_doc = __onload.product_profile_doc || {};

            const paperboards = jQuery
                .map(product_profile_doc.paperboards, d => d.paperboard);

            const filters = {
                name: ["in", paperboards.join(",")],
            };
            return { filters };
        };

        frm.set_query("paperboard", query);
    },

    set_backboard_query(frm) {
        const {
            doc: {
                __onload: {
                    product_profile_doc,
                }
            }
        } = frm;

        const query = () => {
            const backboards = product_profile_doc
                .backboards
                .map(d => d.paperboard);

            const filters = {
                name: ["in", backboards.join(",")],
            };
            return { filters };
        };

        frm.set_query("backboard", query);
    },

    set_printing_query(frm) {
        const query = () => {
            const {
                doc: {
                    __onload = {}
                }
            } = frm;
            const product_profile_doc = __onload.product_profile_doc || {};

            const features = product_profile_doc
                .printing_features
                .map(d => d.product_feature);

            const filters = {
                name: ["in", features.join(",")],
            };
            return { filters };
        };

        frm.set_query("printing_feature", query);
    },

    set_control_query(frm) {
        const query = () => {
            const {
                doc: {
                    __onload = {}
                }
            } = frm;
            const product_profile_doc = __onload.product_profile_doc || {};

            const features = product_profile_doc
                .control_features
                .map(d => d.product_feature);

            const filters = {
                name: ["in", features.join(",")],
            };
            return { filters };
        };

        frm.set_query("control_feature", query);
    },

    set_cutting_query(frm) {
        const query = () => {
            const {
                doc: {
                    __onload = {}
                }
            } = frm;
            const product_profile_doc = __onload.product_profile_doc || {};

            const features = product_profile_doc
                .cutting_features
                .map(d => d.product_feature);

            const filters = {
                name: ["in", features.join(",")],
            };
            return { filters };
        };

        frm.set_query("cutting_feature", query);
    },

    set_gluing_query(frm) {
        const query = () => {
            const {
                doc: {
                    __onload = {}
                }
            } = frm;
            const product_profile_doc = __onload.product_profile_doc || {};

            const features = product_profile_doc
                .gluing_features
                .map(d => d.product_feature);

            const filters = {
                name: ["in", features.join(",")],
            };
            return { filters };
        };

        frm.set_query("gluing_feature", query);
    },

    set_folding_query(frm) {
        const query = () => {
            const {
                doc: {
                    __onload = {}
                }
            } = frm;
            const product_profile_doc = __onload.product_profile_doc || {};

            const features = product_profile_doc
                .folding_features
                .map(d => d.product_feature);

            const filters = {
                name: ["in", features.join(",")],
            };
            return { filters };
        };

        frm.set_query("folding_feature", query);
    },

    set_protection_query(frm) {
        const fieldname = "protection_features";
        const { get_available_list } = frappe.events.product_assembly;

        const query = () => {
            const features = get_available_list(fieldname);

            const filters = {
                name: ["in", features.join(",")],
            };
            return { filters };
        };

        frm.set_query(fieldname, query);
    },

    set_utils_query(frm) {
        const fieldname = "utils_features";
        const { get_available_list } = frappe.events.product_assembly;

        const query = () => {
            const features = get_available_list(fieldname);

            const filters = {
                name: ["in", features.join(",")],
            };
            return { filters };
        };

        frm.set_query(fieldname, query);
    },

    set_texture_query(frm) {
        const fieldname = "texture_features";
        const { get_available_list } = frappe.events.product_assembly;

        const query = () => {
            const features = get_available_list(fieldname);

            const filters = {
                name: ["in", features.join(",")],
            };
            return { filters };
        };

        frm.set_query(fieldname, query);
    },

    add_reload_product_profile_button(frm) {
        const { doc } = frm;
        const label = __("Product Profile");
        const parent = __("Reload");

        if (!doc.product_profile) {
            return false;
        }

        const action = event => {
            frm.trigger("fetch_product_profile_details");
        };

        frm.add_custom_button(label, action, parent);
    },
    add_view_items_button(frm) {
        const label = __("Item");
        const parent = __("View");
        const route_options = {
            "ref_doctype": frm.doctype,
            "ref_docname": frm.docname,
        };

        const action = event => {
            frappe.route_options = route_options;
            frappe.set_route("List", "Item", "List");
        };

        if (frm.is_new()) {
            return false;
        }

        frm.add_custom_button(label, action, parent);
    },

    set_color_masks(frm) {
        const selector_template = "input[data-fieldname=%(fieldname)s]";
        const fields = [
            "front_colors",
            "pantone_colors",
            "back_colors",
            "pantone_back_colors",
        ];

        jQuery.map(fields, fieldname => {
            // pantone_
            const fieldsdict = { fieldname };
            const selector = repl(selector_template, fieldsdict);

            let mask = {
                'translation': {
                    C: { pattern: /[0-4]/ },
                }
            };

            if (fieldname.includes("pantone")) {
                mask = {
                    'translation': {
                        C: { pattern: /[0-9]/ },
                    }
                };
            }

            jQuery(selector).mask('C', mask);
        });
    },

    handle_is_compound_product(frm) {
        const { doc } = frm;

        const msgparts = new Array();

        msgparts.push(__("If you mark this product as Compound Product, it will be cleared."));
        msgparts.push(__("Are you sure you want to continue?"));

        const msg = msgparts.join(" ");

        const ifyes = event => {
            frappe.run_serially([
                () => frm.trigger("clear_compound_product_fields"),
                () => frm.trigger("set_is_compound_product_silently"),
                () => frm.trigger("toggle_display_fields"),
            ]);
        };

        const ifno = event => {
            // pass
        };

        frappe.confirm(msg, ifyes, ifno);
    },

    set_is_compound_product_silently(frm) {
        const { doc } = frm;

        doc.is_compound_product = 1;
        frm.refresh_field("is_compound_product");
    },

    unset_is_compound_product_silently(frm) {
        const { doc } = frm;

        doc.is_compound_product = 0;
        frm.refresh_field("is_compound_product");
    },

    clear_compound_product_fields(frm) {
        const fields_to_clear = [
            ["dimension", null],
            ["paperboard", null],
            ["paperboard_name", null],
            ["backboard", null],
            ["backboard_name", null],
            ["horizontal_margin", .000],
            ["vertical_margin", .000],
            ["printing_feature", null],
            ["control_feature", null],
            ["cutting_feature", null],
            ["gluing_feature", null],
            ["folding_feature", null],
            ["protection_features", []],
            ["utils_features", []],
            ["texture_features", []],
        ];

        const clearfunc = ([fieldname, value]) => {
            frm.set_value(fieldname, value);
        };

        jQuery.map(fields_to_clear, clearfunc);

        // frm.toggle_reqd(fields_to_enable, false);
        // frm.toggle_display(fields_to_enable, false);
    },

    disable_compound_product_fields(frm) {
        const fields_to_enable = [
            "dimension",
            "paperboard",
            "keep_stock",
            "horizontal_margin",
            "vertical_margin",
            "is_compound_product",
            "item_group_1",
            "item_group_2",
            "item_group_3",
            "item_group_4",
            "printing_feature",
            "control_feature",
            "cutting_feature",
            "gluing_feature",
            "folding_feature",
            "protection_features",
            "utils_features",
            "texture_features",
        ];

        frm.toggle_display(fields_to_enable, false);
        frm.trigger("set_is_compound_product_silently");
    },

    re_render_form(frm) {
        frappe.run_serially([
            () => frm.trigger("clear_fields"),
            () => frm.trigger("set_default_values"),
            () => frm.trigger("set_custom_queries"),
            () => frm.trigger("toggle_display_fields"),
        ]);
    },

    clear_fields(frm) {
        const fields_list = [
            ["dimension", null],
            ["horizontal_margin", 0],
            ["vertical_margin", 0],
            ["item_group_1", null],
            ["item_group_2", null],
            ["item_group_3", null],
            ["item_group_4", null],
            ["paperboard", null],
            ["paperboard_name", null],
            ["backboard", null],
            ["backboard_name", null],
            ["front_colors", 0],
            ["pantone_colors", 0],
            ["back_colors", 0],
            ["pantone_back_colors", 0],
            ["printing_feature", null],
            ["control_feature", null],
            ["cutting_feature", null],
            ["gluing_feature", null],
            ["folding_feature", null],
            ["protection_features", new Array()],
            ["utils_features", new Array()],
            ["texture_features", new Array()],
            ["unique_hash", null],
        ];

        jQuery.map(fields_list, function ([fieldname, value]) {
            frm.set_value(fieldname, value);
        });
    },

    set_default_values(frm) {
        const { doc } = frm;
        const {
            __onload = {}
        } = doc;
        const product_profile_doc = __onload.product_profile_doc || {};

        const fields = [
            ["item_group_1", "parent_item_group"],
            ["item_group_2", "item_group"],
            // ["item_group_3", "item_group_3"],
            // ["item_group_4", "item_group_4"],
            ["keep_stock", "keep_stock"],
        ];

        fields.map(function ([target, source]) {
            doc[target] = product_profile_doc[source];
        });

        frm.refresh_fields();
    },

    toggle_display_fields(frm) {
        const { doc } = frm;
        const {
            __onload = {}
        } = doc;

        const product_profile_doc = __onload.product_profile_doc || {};

        const fields_list = [
            ["horizontal_margin", "allow_printing", d => !!d],
            ["vertical_margin", "allow_printing", d => !!d],
            ["section_break_13", "allow_printing", d => !!d],
            ["dimension", "dimensions", d => !!d],
            ["paperboard", "paperboards", d => !!d],
            ["paperboard_name", "paperboards", d => !!d],
            ["backboard", "has_backboard", d => !!d],
            ["front_colors", "allow_printing", d => !!d],
            ["pantone_colors", "allow_printing", d => !!d],
            ["back_colors", "double_sided", d => !!d],
            ["pantone_back_colors", "double_sided", d => !!d],
            ["printing_feature", "printing_features", d => !!d.length],
            ["control_feature", "control_features", d => !!d.length],
            ["cutting_feature", "cutting_features", d => !!d.length],
            ["gluing_feature", "gluing_features", d => !!d.length],
            ["folding_feature", "folding_features", d => !!d.length],
            ["protection_features", "protection_features", d => !!d.length],
            ["utils_features", "utils_features", d => !!d.length],
            ["texture_features", "texture_features", d => !!d.length],
        ];

        jQuery.map(fields_list, function ([target, source, condition]) {
            const value = product_profile_doc[source];

            if (!value) {
                frm.toggle_display(target, false);
                return false;
            }

            const display = condition(value) && !doc.is_compound_product;

            frm.toggle_display(target, display);
        });

        frm.refresh_fields();
    },

    set_item_group_query(frm) {
        const { doc } = frm;
        const opts = {
            filters: {
                parent_item_group: doc.parent_item_group,
            }
        };

        frm.set_query("item_group", opts);
    },

    fetch_product_profile_details(frm) {
        const callback = () => {
            frm.trigger("re_render_form");
        };

        frm.call("add_product_profile_details")
            .then(callback);
    },

    product_profile(frm) {
        const { doc } = frm;

        if (doc.product_profile) {
            frappe.run_serially([
                () => frm.trigger("fetch_product_profile_details"),
                () => frm.trigger("add_reload_product_profile_button"),
            ]);
        }
    },

    paperboard(frm) {
        const { doc } = frm;

        if (!doc.paperboard) {
            frm.set_value("paperboard_name", null);
        }
    },

    backboard(frm) {
        const { doc } = frm;

        if (!doc.backboard) {
            frm.set_value("backboard_name", null);
        }
    },

    item_group_1(frm) {
        // frm.set_value("item_group_2", null);
    },
    item_group_2(frm) {
        // frm.set_value("item_group_3", null);
    },
    item_group_3(frm) {
        // frm.set_value("item_group_4", null);
    },

    is_compound_product(frm) {
        const { doc } = frm;
        const { is_compound_product } = doc;

        if (is_compound_product) {
            frappe.run_serially([
                () => frm.trigger("unset_is_compound_product_silently"),
                // () => frm.trigger("clear_compound_product_fields"),
                () => frm.trigger("handle_is_compound_product"),
            ]);

        } else {
            // frappe.run_serially([
            //     () => frm.trigger("clear_compound_product_fields"),
            //     () => frm.trigger("set_is_compound_product_silently"),
            // ]);
            frappe.run_serially([
                () => frm.trigger("toggle_display_fields"),
            ]);
        }

    },
});

jQuery.extend(frappe.events.product_assembly, {
    get_available_list: function (tablename) {
        const { product_assembly } = frappe.events;

        const all_opts = product_assembly.get_all_options(tablename);
        const chosen_list = product_assembly.get_chosen_list(tablename);

        return all_opts.filter(d => !chosen_list.includes(d));
    },
    get_all_options: function (tablename) {
        const {
            doc: {
                __onload: {
                    product_profile_doc,
                }
            }
        } = cur_frm;

        return product_profile_doc[tablename]
            .filter(d => d.product_feature)
            .map(d => d.product_feature);
    },
    get_chosen_list: function (tablename) {
        const table = cur_frm.doc[tablename];

        const found = table
            .filter(d => d.product_feature)
            .map(d => d.product_feature);

        return found;
    },
});