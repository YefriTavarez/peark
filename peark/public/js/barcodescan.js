// Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
// For license information, please see license.txt

frappe.provide("peark.barcodescan.actions");

(function (jQuery) {
    var _timeoutHandler = 0,
        _inputString = '',
        _onKeypress = function (event) {
            const { target } = event;

            if (_timeoutHandler) {
                clearTimeout(_timeoutHandler);
            }
            if (event.which != 13) {
                _inputString += String.fromCharCode(event.which);
            }

            _timeoutHandler = setTimeout(function () {
                if (_inputString.length <= 3) {
                    _inputString = '';
                    return false;
                }

                if (document.body == target) {
                    // it was handled on a field maybe
                    jQuery(document)
                        .trigger('barcodescan', _inputString);
                }

                _inputString = '';

            }, 90);
        };

    jQuery(document).on({
        keypress: _onKeypress
    });
})(jQuery);

jQuery(document).on("barcodescan", (event, barcode) => {
    const uniquehash = peark.utils.hash();
    const table_template = frappe.render_template("barcode_actions_template");
    // ${__("Barcorde has been scanned")}: 
    // ${__("What do you want to with it?")}
    const title = `
        ${__("Un código de barra ha sido escaneado")}<br>
            <input
                data-fieldname="barcode"
                id="${uniquehash}"
                type="text" value="${barcode}"
                style="border: none;
                outline: none;
                background-color: transparent;"
            />
        ${__("¿Que desea hacer?")}
    `;

    const dialog = frappe.msgprint(`
        ${title}<br>
        ${table_template}
    `, null, true);

    dialog
        .$body
        .find("button[data-action]")
        .on("click", event => {
            const { target } = event;

            const action = jQuery(target)
                .attr("data-action");

            const opts = {
                barcode,
                uniquehash,
            }
            const { actions } = peark.barcodescan;

            actions[action](event, dialog, opts);
        });
});

jQuery.extend(peark.barcodescan.actions, {
    copy(event, dialog, opts) {
        const { barcode, uniquehash } = opts;
        const inputtext = dialog
            .$wrapper
            .find(`input#${uniquehash}`)
            .get(0);
        inputtext.select();
        inputtext.setSelectionRange(0, 99999);
        document.execCommand("copy");

        const alertmsg = __("Barcode copied to clipboard");
        frappe.show_alert(alertmsg);
    },
    searchwebcopy(event, dialog, opts) {
        const { barcode, uniquehash } = opts;
        const baseurl = `https://www.google.com/search?q=${barcode}`;
        window.open(baseurl);
    },
    open(event, dialog, opts) {
        const { barcode } = opts;
        const { location } = window;
        const { origin } = location;
        const method = "peark.controllers.series.get_all_series";

        const get_all_series = (list) => {
            return list.map(d => d.serie);
        };

        const callback = response => {
            let stopsearch = false;
            const { message } = response;

            if (message) {
                jQuery.map(message, ({ doctype, serie }) => {
                    const match = barcode
                        .startsWith(serie);

                    const baseurl = `${origin}/desk#Form/${doctype}/${barcode}`;

                    if (match) {
                        stopsearch = true;
                        open(baseurl);
                    }
                });
            }

            if (!stopsearch) {
                this.show_not_found_msg(event, dialog, opts);
            }
        };

        frappe.call({ method, callback });
    },
    show_not_found_msg(event, olddialog, opts) {
        // const infomsg = __("We didn't find what you were looking for.");
        const infomsg = __("No pudimos encontrar lo que estaba buscando.");
        const dialog = frappe.msgprint(infomsg);

        let counter = 10000;
        const id = setInterval(function () {
            if (!counter) {
                dialog.hide();
                clearInterval(id);
            }

            counter -= 1000;

            const timeleft = (counter / 1000) + 1;
            // ${__("Will hide in {0} seconds", [timeleft])}
            const html = `
                <span>
                    ${__("Se ocultará en {0} segundos", [timeleft])}
                </span>
            `;

            dialog
                .$body
                .parents(".modal-content")
                .find(".modal-message")
                .removeClass("hide")
                .html(html);
        }, 1000);
    }
});
