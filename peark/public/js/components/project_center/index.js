import ProjectTableComponent from './ProjectTable.vue';
import ProjectDashboardComponent from './ProjectDashboard.vue';
import ProgressBar from './ProgressBar.vue';

frappe.provide("peark.utils");

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

class ProjectDashboard {
	constructor({
		wrapper,
		opts,
		frm
	} = {}) {

		this.wrapper = wrapper.get ? wrapper.get(0) : wrapper;
		// this.production_order = production_order;
		Object.assign(this, opts);
		this.frm = frm;

		this.$projectdashboard = new Vue({
			el: this.wrapper,
			render: h => h(ProjectDashboardComponent, {
				props: {
					opts: opts,
					frm: this.frm
				}
			})
		});
	}
}

peark.utils.ProgressBar = ProgressBar;
peark.utils.ProjectTable = ProjectTable;
peark.utils.ProjectDashboard = ProjectDashboard;
