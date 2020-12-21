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
        },
    },
}
</script>