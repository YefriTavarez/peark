import TaskListComponent from './TaskList.vue';

frappe.provide("frappe.ui");

class TaskList {
    constructor({
        wrapper,
        tasks,
        frm
    } = {}) {
        this.wrapper = wrapper.get ? wrapper.get(0) : wrapper;

        this.$tasklist = new Vue({
            el: this.wrapper,
            render: h => h(TaskListComponent, {
                props: {
                    tasks,
                    frm
                }
            })
        });
    }
}

frappe.ui.TaskList = TaskList;


