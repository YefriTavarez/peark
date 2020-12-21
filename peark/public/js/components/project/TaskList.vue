<template>
    <table class="table table table-bordered">
        <thead>
            <tr>
                <th>{{ __("Sr") }}</th>
                <th>{{ __("Subject") }}</th>
                <th>{{ __("Status") }}</th>
                <th>{{ __("Actions") }}</th>
            </tr>
        </thead>
        <tbody>
            <task-item 
                v-for="(task, index) in tasks" 
                :key="index"
                v-bind:task="task"
                @update-status="updateStatus"
            />
        </tbody>
    </table>
</template>

<script>
import TaskItem from './TaskItem.vue';
export default {
    name: 'TaskList',
    components: { 
        TaskItem 
    },
    props: {
        tasks: {
            default: new Array(),
        },
        frm: {
            default: null,
        }
    },
    methods: {
        updateStatus(name) {
            const { tasks } = this;

            tasks
                .map((task, idx) => {
                    const { status } = task;

                    if (task.name == name) {
                        if (status === "Completed") {
                            this.tasks[idx].status = "Open";
                        } else {
                            this.tasks[idx].status = "Completed";
                        }

                        console.log({ newStatus: this.tasks[idx].status });
                    }
                });
        }
    }
}
</script>