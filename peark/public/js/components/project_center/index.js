import ProjectTableComponent from './ProjectTable.vue';

frappe.provide("frappe.ui");

class ProjectTable {
	constructor({
		wrapper,
		projects,
		frm
	} = {}) {

		this.wrapper = wrapper.get ? wrapper.get(0) : wrapper;
		this.projects = projects;
		this.frm = frm;

		this.$projectable = new Vue({
			el: this.wrapper,
			render: h => h(ProjectTableComponent, {
				props: {
					projects: this.projects,
					frm: this.frm
				}
			})
		});
	}
}

frappe.ui.ProjectTable = ProjectTable;
