frappe.ui.form.on("Material Request", {
    refresh(frm) {

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