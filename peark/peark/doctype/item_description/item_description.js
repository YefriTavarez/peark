// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

(function ({ db, model }) {
    const ItemDescription = {
        refresh(frm) {
            frappe.run_serially([
                () => frm.trigger("disable_save"),
                () => frm.trigger("toggle_reqd_fields"),
                () => frm.trigger("toggle_show_description_button"),
            ]);
        },

        disable_save(frm) {
            frm.disable_save();
        },

        allow_short_description(frm) {
            frappe.run_serially([
                () => frm.trigger("toggle_reqd_fields"),
                () => frm.trigger("toggle_show_description_button"),
            ]);
        },

        allow_material(frm) {
            frappe.run_serially([
                () => frm.trigger("toggle_reqd_fields"),
                () => frm.trigger("toggle_show_description_button"),
            ]);
        },

        allow_make(frm) {
            frappe.run_serially([
                () => frm.trigger("toggle_reqd_fields"),
                () => frm.trigger("toggle_show_description_button"),
            ]);
        },

        allow_model(frm) {
            frappe.run_serially([
                () => frm.trigger("toggle_reqd_fields"),
                () => frm.trigger("toggle_show_description_button"),
            ]);
        },

        allow_color(frm) {
            frappe.run_serially([
                () => frm.trigger("toggle_reqd_fields"),
                () => frm.trigger("toggle_show_description_button"),
            ]);
        },

        allow_dimension(frm) {
            frappe.run_serially([
                () => frm.trigger("toggle_reqd_fields"),
                () => frm.trigger("toggle_show_description_button"),
            ]);
        },
        allow_height(frm) {
            frappe.run_serially([
                () => frm.trigger("toggle_reqd_fields"),
                () => frm.trigger("toggle_show_description_button"),
            ]);
        },

        allow_depth(frm) {
            frappe.run_serially([
                () => frm.trigger("toggle_reqd_fields"),
                () => frm.trigger("toggle_show_description_button"),
            ]);
        },

        item_name(frm) {
            const { doc } = frm;
            const value = ItemDescription
                .title_case(doc.item_name,
                    doc.ignore_case_for_item_name);

            const equals = value == doc.item_name;

            if (equals) {
                frm.trigger("toggle_show_description_button");
            } else {
                frm.set_value("item_name", value);
            }
        },

        short_description(frm) {
            const { doc } = frm;
            const value = ItemDescription
                .title_case(doc.short_description,
                    doc.ignore_case_for_short_description);

            const equals = value == doc.short_description;

            if (equals) {
                frm.trigger("toggle_show_description_button");
            } else {
                frm.set_value("short_description", value);
            }
        },

        material(frm) {
            const { doc } = frm;
            const value = ItemDescription
                .title_case(doc.material);

            const equals = value == doc.material;

            if (equals) {
                frm.trigger("toggle_show_description_button");
            } else {
                frm.set_value("material", value);
            }
        },

        make(frm) {
            const { doc } = frm;
            const value = ItemDescription
                .title_case(doc.make,
                    doc.ignore_case_for_make);

            const equals = value == doc.make;

            if (equals) {
                frm.trigger("toggle_show_description_button");
            } else {
                frm.set_value("make", value);
            }
        },

        model(frm) {
            const { doc } = frm;
            const value = ItemDescription
                .title_case(doc.model,
                    doc.ignore_case_for_model);

            const equals = value == doc.model;

            if (equals) {
                frm.trigger("toggle_show_description_button");
            } else {
                frm.set_value("model", value);
            }
        },

        color(frm) {
            const { doc } = frm;
            const value = ItemDescription
                .title_case(doc.color);

            const equals = value == doc.color;

            if (equals) {
                frm.trigger("toggle_show_description_button");
            } else {
                frm.set_value("color", value);
            }
        },

        height(frm) {
            const { doc } = frm;

            if (doc.height) {
                frm.trigger("set_dimension");
            }

            const value = ItemDescription
                .title_case(doc.height);

            const equals = value == doc.height;

            if (equals) {
                frm.trigger("toggle_show_description_button");
            } else {
                frm.set_value("height", value);
            }
        },

        heigt_uom(frm) {
            const { doc } = frm;

            if (doc.heigt_uom) {
                frm.trigger("set_dimension");
            }

            frm.trigger("toggle_show_description_button");
        },

        width(frm) {
            const { doc } = frm;

            if (cstr(doc.width)) {
                frm.trigger("set_dimension");
            }

            const value = ItemDescription
                .title_case(cstr(doc.width));

            const equals = value == cstr(doc.width);

            if (equals) {
                frm.trigger("toggle_show_description_button");
            } else {
                frm.set_value("width", value);
            }
        },

        width_uom(frm) {
            const { doc } = frm;

            if (doc.width_uom) {
                frm.trigger("set_dimension");
            }

            frm.trigger("toggle_show_description_button");
        },

        depth(frm) {
            const { doc } = frm;

            if (cstr(doc.depth)) {
                frm.trigger("set_dimension");
            }

            const value = ItemDescription
                .title_case(cstr(doc.depth));

            const equals = value == cstr(doc.depth);

            if (equals) {
                frm.trigger("toggle_show_description_button");
            } else {
                frm.set_value("depth", value);
            }
        },

        depth_uom(frm) {
            const { doc } = frm;

            if (doc.depth_uom) {
                frm.trigger("set_dimension");
            }

            frm.trigger("toggle_show_description_button");
        },

        set_dimension(frm) {
            const { doc } = frm;

            let dimension = null;

            if (
                doc.allow_dimension
                && doc.width
                && doc.width_uom
            ) {
                dimension = `${doc.width} ${doc.width_uom}`;
            }

            if (
                doc.allow_dimension
                && doc.width
                && doc.width_uom
                && doc.allow_height
                && doc.height
                && doc.heigt_uom
            ) {
                dimension = `${doc.width} ${doc.width_uom} x ${doc.height} ${doc.heigt_uom}`;
            }

            if (
                doc.allow_dimension
                && doc.width
                && doc.width_uom
                && doc.allow_height
                && doc.height
                && doc.heigt_uom
                && doc.allow_depth
                && doc.depth
                && doc.depth_uom
            ) {
                dimension = `${doc.width} ${doc.width_uom} x ${doc.height} ${doc.heigt_uom} x ${doc.depth} ${doc.depth_uom}`;
            }

            doc.dimension = dimension;
        },

        toggle_show_description_button(frm) {
            const passed = ItemDescription
                .check_mandatory(frm);

            if (passed) {
                frm.trigger("show_description_button");
            } else {
                frm.trigger("hide_description_button");
            }
        },

        show_description_button(frm) {
            const { doc } = frm;

            const get_message = function () {
                const fieldlist = new Array();
                const fields_dict = {
                    "item_name": () => !!doc.item_name,
                    "short_description": () => doc.allow_short_description && doc.short_description,
                    "material": () => doc.allow_material && doc.material,
                    "make": () => doc.allow_make && doc.make,
                    "model": () => doc.allow_model && doc.model,
                    "color": () => doc.allow_color && doc.color,
                    "dimension": () => doc.allow_dimension && doc.height && doc.heigt_uom && doc.width && doc.width_uom,
                    // "height": () => doc.allow_dimension && doc.height,
                    // "heigt_uom": () => doc.allow_dimension && doc.heigt_uom,
                    // "width": () => doc.allow_dimension && doc.width,
                    // "width_uom": () => doc.allow_dimension && doc.width_uom,
                    // "depth": () => doc.allow_dimension && doc.allow_depth && doc.depth,
                    // "depth_uom": () => doc.allow_dimension && doc.allow_depth && doc.depth_uom,
                };

                for (const fieldname in fields_dict) {
                    const expression = fields_dict[fieldname];

                    if (expression()) {
                        const value = doc[fieldname];
                        fieldlist.push(value);
                    }
                }

                return `${fieldlist.join(", ")}.`;
            };


            const label = __("Description");
            // const parent = __("Show");

            const action = function (event) {
                const title = __("Item Description");
                const message = get_message();

                frappe.msgprint(message, title);
            };

            frm.add_custom_button(label, action);
            frm.add_custom_button(__("Item"), _ => {
                const doc = frappe.model.get_new_doc("Item");
                Object.assign(doc, {
                    "description": get_message(),
                    "item_name": frm.doc.item_name,
                });

                frappe.set_route("Form", doc.doctype, doc.name);
            });
        },

        hide_description_button(frm) {
            const label = __("Description");
            const parent = __("Show");

            frm.remove_custom_button(label);
        },

        toggle_reqd_fields(frm) {
            const doctype = "Item Description";
            const meta = frappe.get_meta(doctype);

            const { fields } = meta;

            fields.map(function (docfield) {
                const { depends_on, fieldname } = docfield;

                if (!depends_on) {
                    return false;
                }

                const reqd = ItemDescription
                    .evaluate_depends_on_value(frm, depends_on);

                frm.toggle_reqd(fieldname, reqd);
            });
        },

        evaluate_depends_on_value: function (frm, expression) {
            const { doc } = frm;

            let out = null;

            if (typeof (expression) === 'boolean') {
                out = expression;

            } else if (typeof (expression) === 'function') {
                out = expression(doc);

            } else if (expression.substr(0, 5) == 'eval:') {
                out = eval(expression.substr(5));
            } else if (expression.substr(0, 3) == 'fn:' && frm) {
                out = frm.script_manager.trigger(expression.substr(3), frm.doctype, frm.docname);
            } else {
                var value = doc[expression];
                if (jQuery.isArray(value)) {
                    out = !!value.length;
                } else {
                    out = !!value;
                }
            }

            return out;
        },

        check_mandatory(frm) {
            var has_errors = false;
            // frm.scroll_set = false;

            if (frm.doc.docstatus == 2) return true; // don't check for cancel

            jQuery.each(frappe.model.get_all_docs(frm.doc), function (i, doc) {
                var error_fields = [];
                var folded = false;

                jQuery.each(frappe.meta.docfield_list[doc.doctype] || [], function (i, docfield) {
                    if (docfield.fieldname) {
                        var df = frappe.meta.get_docfield(doc.doctype,
                            docfield.fieldname, frm.doc.name);

                        if (df.fieldtype === "Fold") {
                            folded = frm.layout.folded;
                        }

                        if (df.reqd && !frappe.model.has_value(doc.doctype, doc.name, df.fieldname)) {
                            has_errors = true;
                            error_fields[error_fields.length] = __(df.label);
                            // scroll to field
                            // if (!frm.scroll_set) {
                            //     scroll_to(doc.parentfield || df.fieldname);
                            // }

                            if (folded) {
                                frm.layout.unfold();
                                folded = false;
                            }
                        }

                    }
                });

                // if (frm.is_new() && frm.meta.autoname === 'Prompt' && !frm.doc.__newname) {
                //     error_fields = [__('Name'), ...error_fields];
                // }

                // if (error_fields.length) {
                //     let meta = frappe.get_meta(doc.doctype);
                //     if (meta.istable) {
                //         var message = __('Mandatory fields required in table {0}, Row {1}',
                //             [__(frappe.meta.docfield_map[doc.parenttype][doc.parentfield].label).bold(), doc.idx]);
                //     } else {
                //         var message = __('Mandatory fields required in {0}', [__(doc.doctype)]);
                //     }
                //     message = message + '<br><br><ul><li>' + error_fields.join('</li><li>') + "</ul>";
                //     frappe.msgprint({
                //         message: message,
                //         indicator: 'red',
                //         title: __('Missing Fields')
                //     });
                // }
            });

            return !has_errors;
        },

        title_case(value, ignore_case) {
            if (!cstr(value)) {
                return null;
            }

            if (ignore_case) {
                return value;
            }

            const articles = [
                "al", "el", "la", "las", "lo", "los",
                "un", "uno", "unos", "una", "unas", "para", "por", "y",
                "de", "del", "desde", "hasta", "con", "que", "es", "esta"
            ];

            const sentence = cstr(value)
                .trim()
                .toLowerCase()
                .split(" ");

            for (let index = 0; index < sentence.length; index++) {
                const word = cstr(sentence[index]);

                if (word.trim() && !articles.includes(word)) {
                    const [first] = word.toUpperCase();

                    sentence[index] = first + word.slice(1);
                }
            }

            return sentence.join(" ");
        }
    };

    frappe.ui.form.on('Item Description', ItemDescription);
})(frappe);
