<template>
    <tr>
        <td data-column="idx" class="text-right">{{ task.idx }}</td>
        <td data-column="subject">
            <a @click.prevent="view_task">
                {{ task.name }}
            </a>
            {{ task.subject }}
        </td>
        <td data-column="status">{{ displayStatus }}</td>
        <td data-column="actions">
            <button
                @click="updateStatus"
                class="btn btn-default btn-xs"
            >
                {{ actionLabel }}
            </button>
        </td>
    </tr>
</template>

<script>
export default {
    name: "TaskItem",
    props: {
        task: {
            default: {},
        },
    },
    methods: {
        view_task() {
            frappe.set_route("Form", "Task", this.task.name);
        },
        updateStatus() {
            this.task.status = "Closed";
            // this.$emit("update-status", this.task.name);
        }
    },
    computed: {
        displayStatus() {
            return __(this.task.status);
        },
        actionLabel() {
            const { status } = this.task;

            if (status === "Completed") {
                return __("Re-Open");
            } else {
                return __("Close");
            }
        }
    }
}
</script>

<style scoped>

</style>