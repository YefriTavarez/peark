<template>
    <tr>
        <td data-column="idx" class="text-right">{{ displayIndex }}</td>
        <td data-column="subject">
            <a @click.prevent="view_task">
                {{ opts.subject }}
            </a>
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
    data() {
        return {
            opts: new Array(),
        };
    },
    props: {
        task: {
            default: {},
        },
        index: {
            default: 0,
        }
    },
    methods: {
        view_task() {
            frappe.set_route("Form", "Task", this.task.name);
        },
        updateStatus() {
            const { opts } = this;

            opts.oldStatus = this.status;

            if (opts.status === "Completed") {
                opts.status = "Open";
            } else {
                opts.status = "Completed";
            }

            this.updateDbStatus();
        },
        updateDbStatus() {
            const { opts } = this;
            const { status, name } = opts;

            const method = "peark.controllers.erpnext.project.update_task";
            const action =  (status === "Completed") ? "close" : "open";

            const args = { status, name };

            const callback = response => {
                if (cur_frm.doc.__unsaved) {
                    cur_frm.dashboard.clear_headline();
                    cur_frm.dashboard.set_headline_alert(__("This form has been modified after you have loaded it")
                        + '<a class="btn btn-xs btn-link pull-right" onclick="cur_frm.reload_doc()">'
                        + __("Refresh") + '</a>', "alert-warning");

                    opts.status = opts.oldStatus;
                } else {
                    // cur_frm.reload_doc();
                    const { doc } = cur_frm;
                    const { 
                        message: {
                            percent_complete,
                            status,
                        },
                    } = response;

                    doc.percent_complete = percent_complete;
                    doc.status = status;

                    cur_frm.refresh_fields();
                    cur_frm.refresh_header();
                }
            };

            frappe.call({ method, args, callback });
        },
    },
    computed: {
        displayStatus() {
            return __(this.opts.status);
        },
        actionLabel() {
            const { status } = this.opts;

            if (status == "Completed") {
                return __("Re-Open");
            } else {
                return __("Close");
            }
        },
        displayIndex() {
            const { idx } = this.opts;

            if (!cint(idx)) {
                const { index } = this;

                return cint(index) + 1;
            }

            return idx;
        }
    },
    beforeMount() {
        // magic trick to receive via props
        // and update based on internal state change
        this.opts = this.task;
    }
}
</script>

<style scoped>

</style>