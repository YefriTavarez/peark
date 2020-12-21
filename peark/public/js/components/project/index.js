import TaskListComponent from './TaskList.vue';

frappe.provide("frappe.ui");


class TaskList {
    constructor({
        wrapper,
        tasks,
        frm
    } = {}) {
        
        this.wrapper = wrapper.get ? wrapper.get(0) : wrapper;
        this.tasks = tasks;
        this.frm = frm;

        this.$tasklist = new Vue({
            el: this.wrapper,
            render: h => h(TaskListComponent, {
                props: {
                    tasks: this.tasks,
                    frm: this.frm
                }
            })
        });
        
        this.setup();
    }

    setup() {

    }
}

frappe.ui.TaskList = TaskList;
