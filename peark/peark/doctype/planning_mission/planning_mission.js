// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.provide("frappe.params");
frappe.provide("frappe.flashvals");
frappe.ui.form.on('Planning Mission', {
    refresh(frm) {
        frappe.run_serially([
            () => frm.trigger("should_reload_from_db"),
            () => frm.trigger("should_enable_form"),
            () => frm.trigger("enable_fields"),
            () => frm.trigger("show_call_to_action_button"),
        ]);
    },
    should_reload_from_db(frm) {
        const { params } = frappe;

        if (params.should_reload) {
            frm.trigger("reload_from_db");

            delete params.should_reload;
        }
    },
    reload_from_db(frm) {
        const { doc } = frm;

        const { model } = frappe;

        const callback = function () {
            // let's just make sure the form is downloaded
            model.remove_from_locals(doc.doctype, doc.name);

            model.with_doc(doc.doctype, doc.name, () => {
                frm.refresh_fields();
            });
        };

        if (doc.parenttype && doc.parent) {
            model.with_doc(doc.parenttype, doc.parent, callback);
            return false;
        }

        callback();
    },

    show_call_to_action_button(frm) {
        const { doc } = frm;
        const { parse } = JSON;
        const { utils } = frappe;

        const {
            name,
            doctype,
            status,
            status_workflow,
        } = doc;

        const filters = { status };
        const workflows = parse(status_workflow);

        const actions = utils
            .filter_dict(workflows, filters);

        const html_rendered = frappe
            .render_template("actions_template", {
                actions: actions.filter(action => {
                    return frappe.user.has_role(action.roles);
                })
            });

        const wrapper = jQuery(frm.wrapper)
            .find("div[data-fieldname=actions]");

        // remove any child
        wrapper.empty();

        const htmlobj = jQuery(html_rendered)
            .appendTo(wrapper);

        jQuery(htmlobj)
            .find("li>a")
            .on("click", event => {
                event.preventDefault();

                const { target } = event;

                const status = jQuery(target)
                    .attr("data-next-status");

                jQuery.extend(frappe.flashvals, { status });

                const event_name = "handle_status_change";

                frm
                    .trigger(event_name);

                frappe.run_serially([
                    () => frappe.timeout(.5),
                    // () => frm.trigger("missions_on_form_rendered"),
                ]);
            });
    },

    handle_status_change(frm) {
        const { parse, stringify } = JSON;

        const { doc } = frm;
        // const doc = frappe.get_doc(doctype, name);

        const { db, model } = frappe;

        if (!doc.data_to_ask) {
            doc.data_to_ask = "[{}]";
        }


        const [data_to_ask] = parse(doc.data_to_ask);

        const {
            source_docfield,
        } = data_to_ask;

        const { status } = frappe.flashvals;

        if (source_docfield) {

            const { value, label } = source_docfield;
            const errmsg = repl(__("Missing value for %(label)s"), { label: __(label) });
            const opts = {
                message: errmsg,
                indicator: "red",
            };

            if (!value && status == "Completed") {
                frappe.msgprint(opts);

                return false;
            }
        }

        const fieldname = "status";

        if (!status) {
            const errmsg = __("Missing value for status");
            const opts = {
                message: errmsg,
                indicator: "red",
            };

            frappe.msgprint(opts);

            return false;
        }

        doc.status = status;

        const after_save = (response) => {
            if (!response.exc) {

                frappe.utils.play_sound("click");

                if (doc.parenttype && doc.parent) {
                    model.with_doc(doc.parenttype, doc.parent, () => {
                        frm.reload_doc();
                    });
                } else {
                    frm.reload_doc();
                }

                frm.trigger("after_save");
                // frm.trigger("missions_on_form_rendered");
            }
        };

        frappe.ui.form.save(frm, "Save", after_save, null);

    },

    validate_status(frm) {
        // frappe.validated: true or false
        const { parse, stringify } = JSON;

        const { doc } = frm;

        let data_to_ask;


        if (!doc.data_to_ask) {
            doc.data_to_ask = "[{}]";
        }

        try {
            data_to_ask = parse(doc.data_to_ask);
        } catch (error) {
            // pass
        }

        if (!data_to_ask && !data_to_ask.data_to_ask) {
            frappe.validated = true;

            return false;
        }

        // jQuery.map(doc.data_to_ask, ({ data_to_ask })
        const [firstrow] = data_to_ask;

        const primary_label = __("Submit");
        const title = __(firstrow.data_to_ask);
        const fields = [firstrow.source_docfield];

        const callback = function (values) {
            const { db } = frappe;

            const doctype = firstrow.target_doctype;
            const name = doc[firstrow.docname_field];
            const fieldname = firstrow.target_fieldname;
            const value = values[firstrow.target_fieldname];
            const callback = response => {
                firstrow.value = value;

                frm.set_value("data_to_ask",
                    stringify([firstrow]));

                frm.trigger("handle_status_change")
            };

            db.set_value(doctype, name, fieldname, value, callback);
        };

        if (!firstrow.value) {
            frappe.prompt(fields, callback, title, primary_label);
        } else {
            frappe.validated = true;
        }
    },

    enable_fields(frm) {
        frappe.run_serially([
            () => frm.trigger("enable_planning_document"),
            () => frm.trigger("hide_open_form"),
            () => frm.trigger("display_go_to_parent"),
            () => frm.trigger("display_status_workflow"),
            () => frm.trigger("display_data_to_ask"),
            () => frm.refresh_fields(),
        ]);
    },

    enable_planning_document(frm) {
        const fieldname = "planning_document";

        frappe.run_serially([
            () => frm.toggle_display(fieldname, true),
            () => frm.toggle_reqd(fieldname, true),
        ]);
    },

    should_enable_form(frm) {
        const { doc } = frm;
        const {
            model: {
                no_value_type
            },
        } = frappe;

        const bigboss_list = [
            "Projects Manager",
            "System Manager",
            "Administrator"
        ];

        const ignore_list = ["status"];

        let enable_form = frappe.user.has_role("Projects User")
            && doc.owner != frappe.session.user
            || frappe.user.has_role(bigboss_list);

        const meta = frappe.get_meta(doc.doctype);
        const fields = meta.fields
            .filter(df => !ignore_list.includes(df.fieldname))
            .filter(df => !no_value_type.includes(df.fieldtype))
            .filter(df => df.read_only == 0)
            .map(df => df.fieldname);

        // fields.push("missions");

        frm.toggle_enable(fields, enable_form);
    },
    planning_document(frm) {
        frm.set_value("planning_mission_template", null);
    },
    planning_mission_template(frm) {
        const { doc } = frm;

        if (!doc.planning_mission_template) {
            return false;
        }

        frm.call("load_mission_template")
            .then(response => {
                // todo
            });
    },
    hide_open_form(frm) {
        frm.toggle_display("open_form", false);
    },
    display_data_to_ask(frm) {
        const { parse, stringify } = JSON;

        const { doc } = frm;
        // const doc = frappe.get_doc(doctype, name);

        const selector = "div[data-fieldname=data_to_ask_display]";

        // jQuery.map(doc.missions, function (childoc) {
        // const { name } = childoc;

        const parent = frm.form_wrapper
            .find(selector)
            .empty()
            .get(0);

        if (!parent) {
            return false;
        }

        if (!doc.data_to_ask) {
            doc.data_to_ask = "[{}]";
        }

        const data_to_ask = parse(doc.data_to_ask);

        let render_input = true;

        if (!data_to_ask || !data_to_ask.length) {
            render_input = false;
            return false;
        }

        if (frm.is_new()) {
            render_input = false;
        }

        jQuery.map(data_to_ask, data => {
            const { source_docfield } = data;
            const df = source_docfield;

            if (!df) {
                return false;
            }

            df.onchange = event => {
                const { target } = event;
                const { value } = target;

                // data_to_ask.value = value;
                df.value = df.default = value;

                doc.data_to_ask = stringify(data_to_ask);

                const event_name = "display_save_button";
                frm
                    .trigger(event_name);
            };

            const control = `Control${df.fieldtype}`;

            const opts = {
                df,
                render_input,
                parent,
            };

            if (doc.status == "Completed") {
                df.read_only = true;
                df.description = __("Reopen to modify");
            }

            const docfield = new frappe.ui.form[control](opts);

            if (df.value) {
                // docfield.$input.val(df.value);
                docfield.set_input(df.value);
                docfield.set_mandatory(df.value);
            }


            frappe.flashvals.cur_docfield = docfield;
        });
    },
    display_save_button(frm) {
        const { parse, stringify } = JSON;
        const { doc } = frm;
        // const doc = frappe.get_doc(doctype, name);

        if (!doc.data_to_ask) {
            doc.data_to_ask = "[{}]";
        }

        const [data_to_ask] = parse(doc.data_to_ask);
        const {
            source_docfield,
            target_doctype,
            target_fieldname,
            docname_field
        } = data_to_ask;

        const html = `<a class="btn btn-default btn-xs">
                ${__("Save")} ${__(source_docfield.label)}
            </a>`;

        const docfield = frappe.flashvals.cur_docfield;

        if (docfield) {
            jQuery(html)
                .appendTo(docfield.$wrapper)
                .on("click", function (event) {
                    const { model } = frappe;

                    const fieldname = "data_to_ask";
                    const { value } = doc.data_to_ask;

                    // key part
                    const target_name = doc[docname_field];

                    model.set_value(doctype, doctype, fieldname, value);
                    // const opts = {
                    //     doctype: target_doctype,
                    //     name: target_name,
                    //     fieldname: target_fieldname,
                    //     value: docfield.get_value(),
                    // };

                    const callback = opts => {
                        const { db } = frappe;

                        // const { doctype,
                        //     name,
                        //     fieldname,
                        //     value } = opts;
                        db.set_value(target_doctype, target_name,
                            target_fieldname, docfield.get_value(), () => {
                                frappe.run_serially([
                                    () => frappe.dom.freeze(),
                                    () => frappe.timeout(2),
                                    () => {
                                        if (doc.parenttype && doc.parent) {
                                            model.with_doc(doc.parenttype, doc.parent, () => {
                                                frm.reload_doc();
                                            });
                                            return false;
                                        } else {
                                            frm.reload_doc();
                                        }
                                    },
                                    () => frappe.dom.unfreeze(),
                                ]);
                            });
                        // db.set_value(doctype, name, fieldname, value);
                    };

                    const after_save = (response) => {
                        if (!response.exc) {

                            frappe.utils.play_sound("click");

                            frm.refresh();

                            frm.trigger("after_save");
                            callback && callback();
                        }
                    };

                    frappe.ui.form.save(frm, "Save", after_save, null);
                });

            // add this button only once
            delete frappe.flashvals.cur_docfield;
        }

    },
    display_status_workflow(frm) {
        const bigboss_list = [
            "System Manager",
            "Administrator"
        ];

        const fieldlist = ["status_workflow"];

        let enable_form = frappe.user.has_role(bigboss_list);

        frm.toggle_display(fieldlist, enable_form);
    },
    display_go_to_parent(frm) {
        frm.toggle_display("go_to_parent", true);
    },
    go_to_parent(frm) {
        const { doc } = frm;

        frappe.set_route("Form", "Planning Document",
            doc.planning_document);
    },
});
