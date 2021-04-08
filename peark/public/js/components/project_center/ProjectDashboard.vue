<template>
  <div class="row">
    <div class="col-sm-6">
      <ProgressBar label="Facturado" :percentage="billedPercent" />
      <ProgressBar label="Entregado" :percentage="deliveredPercent" />
    </div>
    <div class="col-sm-6">
      <div class="col-sm-6">
        <span class="text-right">{{ __("Production Order") }}</span>
        <span
          style="display: block"
          v-if="opts.invoice_count && opts.invoice_count > 0"
          class="text-right"
          >{{ __("Facturas de Venta") }}</span
        ><br>
        <span
          style="display: block"
          v-if="opts.delivery_count && opts.delivery_count > 0"
          class="text-right"
          >{{ __("Notas de Entrega") }}</span
        >
      </div>
      <div class="col-sm-6">
        <strong style="display: block">
          <a
            v-if="opts.production_order != null"
            @click="open_window(opts.production_order)"
            >{{ opts.production_order }}</a
          >
          <span v-else>N/A</span>
        </strong>

        <strong
          v-if="opts.invoice_count && opts.invoice_count > 0"
          style="display: block"
        >
          <a @click="view_invoices">Ver ({{ opts.invoice_count }})</a>
        </strong>
        <strong
          v-if="opts.delivery_count && opts.delivery_count > 0"
          style="display: block"
        >
          <a @click="view_deliveries">Ver ({{ opts.delivery_count }})</a>
        </strong>
      </div>
    </div>
  </div>
</template>

<script>
import ProgressBar from "./ProgressBar.vue";

Vue.directive("width", {
  update: function (el, width, vnode) {
    el.style.width = `${width.value}%`;
  },
  inserted: function (el, width, vnode) {
    el.style.width = `${width.value}%`;
  },
});

export default {
  name: "ProjectDashboard",
  components: {
    ProgressBar,
  },
  props: {
    opts: {
      default: null,
    },
    frm: {
      default: null,
    },
  },
  computed: {
    billedPercent() {
      const { billing_percent } = this.opts;
      return billing_percent ? billing_percent : 0;
    },
    deliveredPercent() {
      const { delivery_percent } = this.opts;
      return delivery_percent ? delivery_percent : 0;
    },
  },
  methods: {
    open_window: (production_order) => {
      const pathname = `desk#Form/Production Order/${production_order}`;
      const url = frappe.urllib.get_full_url(pathname);
      const target = "_blank";

      window.open(url, target);
    },

    view_invoices() {
      const view = "List";
      const doctype = "Sales Invoice";
      const { doc } = this.frm;

      frappe.route_options = {
        project_center: doc.name,
      };

      frappe.set_route(view, doctype);
    },
    view_deliveries() {
      const view = "List";
      const doctype = "Delivery Note";
      const { doc } = this.frm;

      frappe.route_options = {
        project_center: doc.name,
      };

      frappe.set_route(view, doctype);
    },
  },
};
</script>
