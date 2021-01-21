<template>
  <div class="layout-main-section">
    <div class="form-section">
      <div class="row">
        <Dashboard />
      </div>
      <div class="row">
        <FilterSelect />
      </div>
    </div>
    <form @submit.prevent="addTodo" class="header">
      <h2 style="margin: 5px; color: #36414c">{{ __("My Reminders") }}</h2>
      <input type="text" v-model="newTodo" :placeholder="__('Title')" />
      <span @click="addTodo" class="addBtn">{{ __("Add") }}</span>
    </form>

    <ul>
      <li
        :key="todo.name"
        @dblclick="toggleStatus(todo)"
        v-for="todo in displayReminders"
      >
        <i
          class="fa"
          v-bind:class="{
            'fa-check-square-o': todo.workflow_status === 'Completed',
            'fa fa-square-o': todo.workflow_status !== 'Completed',
          }"
          @click="toggleStatus(todo)"
        >
        </i>

        <strong>
          {{ __(todo.workflow_status) }}
          <br v-if="inline(todo)" />
        </strong>

        <span v-html="todo.content" @dblclick="toggleStatus(todo)"></span>
        <i
          v-if="todo.flag"
          class="fa fa-flag"
          v-bind:class="flagClass(todo.flag)"
          aria-hidden="true"
        ></i>

        <div style="position: absolute; bottom: 15.5px; right: 15px">
          <i @click="showDetails(todo)" class="fa fa-pencil action-btn"></i
          >&nbsp;
          <i @click="confirmDeletion(todo)" class="fa fa-trash action-btn"></i>
        </div>
      </li>
    </ul>
    <div v-show="!reminders.length">
      <center style="padding: 25px">{{ __("No Data") }}</center>
    </div>
  </div>
</template>
<script>
import FilterSelect from "./components/FilterSelect.vue";
import Dashboard from "./components/Dashboard.vue";

import store from "./store.js";

const { Vuex } = peark.libs;
// import Vuex from "../../../vuex.js";

export default {
  name: "App",
  components: {
    FilterSelect,
    Dashboard,
  },
  data() {
    return {
      newTodo: "",
    };
  },
  computed: {
    ...Vuex.mapState([
      "reminders",
      "flagColor",
      "statusFilter",
      "lambdaStatusFilters",
    ]),
    displayReminders() {
      if (!this.statusFilter) {
        return this.reminders;
      }

      const lambdaFilter = this.lambdaStatusFilters[this.statusFilter];
      return this.reminders.filter(lambdaFilter);
    },
  },

  methods: {
    ...Vuex.mapActions([
      "saveTodo",
      "toggleStatus",
      "updateTodo",
      "deleteTodo",
    ]),
    addTodo() {
      const { newTodo } = this;

      if (!newTodo) {
        return false;
      }

      this.saveTodo(newTodo);

      this.newTodo = "";
    },
    inline(todo) {
      const { content } = todo;
      return !content.includes("<div");
    },
    flagClass(flag) {
      return {
        yellow: flag == "Yellow",
        red: flag == "Red",
        orange: flag == "Orange",
        green: flag == "Green",
        blue: flag == "Blue",
        purple: flag == "Purple",
        gray: flag == "Gray",
      };
    },
    showDetails(todo) {
      // sample
      // {
      // 	"name": "STMRYVKHCWAGNPQIRMCXDSLILETNHLGNLKJWBCJJYWIHMOMHVC",
      // 	"content": "greet the world",
      // 	"status": "Not Started",
      // 	"closed": false
      // }

      const title = __("Reminder Details");
      const primary_label = __("Save");
      const fields = [
        // {
        //   fieldname: "closed",
        //   fieldtype: "Check",
        //   label: __("Closed?"),
        //   default: todo.closed,
        // },
        {
          fieldtype: "Data",
          fieldname: "name",
          label: __("ID"),
          default: todo.name,
          read_only: true,
        },
        {
          fieldtype: "Select",
          fieldname: "flag",
          label: __("Flag"),
          default: todo.flag,
          options: [
            { label: __("Yellow"), value: "Yellow" },
            { label: __("Red"), value: "Red" },
            { label: __("Orange"), value: "Orange" },
            { label: __("Green"), value: "Green" },
            { label: __("Blue"), value: "Blue" },
            { label: __("Purple"), value: "Purple" },
            { label: __("Gray"), value: "Gray" },
          ],
        },
        {
          fieldtype: "Column Break",
        },
        {
          fieldtype: "Select",
          fieldname: "workflow_status",
          label: __("Status"),
          default: todo.workflow_status,
          reqd: true,
          options: [
            { label: __("Not Started"), value: "Not Started" },
            { label: __("Working"), value: "Working" },
            { label: __("Paused"), value: "Paused" },
            { label: __("Completed"), value: "Completed" },
          ],
        },
        {
          fieldtype: "Data",
          fieldname: "system_status",
          label: __("System Status"),
          default: todo.system_status,
          read_only: true,
        },
        {
          fieldtype: "Section Break",
        },
        {
          fieldtype: "Date",
          fieldname: "posting_date",
          label: __("Posting Date"),
          default: todo.posting_date,
        },
        {
          fieldtype: "Column Break",
        },
        {
          fieldtype: "Date",
          fieldname: "due_date",
          label: __("Due Date"),
          default: todo.due_date,
        },
        {
          fieldtype: "Section Break",
        },
        {
          fieldtype: "Text Editor",
          fieldname: "content",
          label: __("Content"),
          default: todo.content,
          reqd: true,
        },
      ];

      const callback = (values) => {
        this.updateTodo(values);
      };

      frappe.prompt(fields, callback, title, primary_label);
    },
    confirmDeletion(todo) {
      const message = __("Delete permanently?");
      const ifyes = () => {
        this.deleteTodo(todo);
      };

      const ifno = () => {
        frappe.show_alert(__("No changes made"));
      };
      frappe.confirm(message, ifyes, ifno);
    },
  },
  created() {
    store.commit("initialize");
  },
};
</script>
<style>
.fa.fa-flag.yellow {
  color: #feef72;
}

.fa.fa-flag.red {
  color: #ff5858;
}

.fa.fa-flag.orange {
  color: #ffa00a;
}

.fa.fa-flag.green {
  color: #98d85b;
}

.fa.fa-flag.blue {
  color: #5e64ff;
}

.fa.fa-flag.purple {
  color: #743ee2;
}

.fa.fa-flag.gray {
  color: #f0f4f7;
}
</style>