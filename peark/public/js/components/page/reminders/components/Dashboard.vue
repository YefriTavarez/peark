<template>
  <div class="container">
    <div class="col-sm-3">
      <table class="table table-bordered table-condensed">
        <thead>
          <tr>
            <th>{{ __("Not Started") }}</th>
            <th>{{ __("Completed") }}</th>
            <th>{{ __("Total") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-right">
              <strong>{{ openReminders }} </strong>
            </td>
            <td class="text-right">
              <strong>{{ completedReminders }} </strong>
            </td>
            <td class="text-right">
              <strong>{{ allReminders }} </strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="col-sm-9">
      <p>{{ __("Progress") }}</p>
      <div class="completeness-back">
        <div class="progress completeness" v-width="completedPercentage">
          {{ completedPercentage }}%
        </div>
      </div>
    </div>
  </div>
</template>
<script>
const { Vuex } = peark.libs;

Vue.directive("width", {
  update: function (el, width, vnode) {
    el.style.width = `${width.value}%`;
  },
  inserted: function (el, width, vnode) {
    el.style.width = `${width.value}%`;
  },
});

export default {
  name: "Dashboard",
  computed: {
    ...Vuex.mapState(["reminders", "namespace"]),
    completedReminders() {
      return this.reminders.filter((d) => d.workflow_status === "Completed").length || 0;
    },
    openReminders() {
      return this.reminders.filter((d) => d.workflow_status !== "Completed").length || 0;
    },
    allReminders() {
      return this.reminders.length;
    },
    completedPercentage() {
      const { reminders } = this;

      const completedFilter = (d) => d.workflow_status === "Completed";

      const completedReminders = reminders.filter(completedFilter).length;
      const allReminders = reminders.length;

      if (!allReminders) {
        return 0;
      }

      return Math.round((completedReminders / allReminders) * 100, 2);
    },
  },
};
</script>
<style scoped>
.completeness-back {
  width: 97%;
  background-color: #ddd;
}

.progress {
  text-align: center;
  padding-top: 10px;
  padding-bottom: 10px;
  color: white;
  height: 37px;
}

.completeness {
  background-color: #3f51b5;
}
</style>