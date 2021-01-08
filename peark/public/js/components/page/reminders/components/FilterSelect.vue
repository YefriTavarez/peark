<template>
  <div class="form-column col-sm-3">
    <form>
      <div
        class="frappe-control input-max-width"
        data-fieldtype="Select"
        data-fieldname="status"
      >
        <div class="form-group">
          <div class="clearfix">
            <label class="control-label" style="padding-right: 0px">{{
              __("Status")
            }}</label>
          </div>
          <div class="control-input-wrapper">
            <div class="control-input flex align-center">
              <select
                v-model="statusFilter"
                @change="handleStatusChange"
                autocomplete="off"
                class="input-with-feedback form-control bold"
                data-fieldtype="Select"
                data-fieldname="status"
              >
                <option value=""></option>
                <option value="Not Completed">{{ __("Not Completed") }}</option>
                <option value="Not Started">{{ __("Not Started") }}</option>
                <option value="Working">{{ __("Working") }}</option>
                <option value="Completed">{{ __("Completed") }}</option>
                <option value="Overdue">{{ __("Overdue") }}</option>
                <option value="Cancelled">{{ __("Cancelled") }}</option>
              </select>
              <i class="octicon octicon-chevron-down text-muted"></i>
            </div>
            <div
              class="control-value like-disabled-input bold"
              style="display: none"
            >
              Seleccionar
            </div>
            <p class="help-box small text-muted hidden-xs"></p>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
<script>
const { Vuex } = peark.libs;

export default {
  name: "FilterSelect",
  data() {
    return {
      statusFilter: "Not Started",
    };
  },
  // computed: {
  //   ...Vuex.mapState(["statusFilter"]),
  // },

  methods: {
    ...Vuex.mapActions(["loadTodos", "updateFilter"]),
    handleStatusChange() {
      this.updateFilter(this.statusFilter);
      this.loadTodos();
    },
  },
};
</script>
