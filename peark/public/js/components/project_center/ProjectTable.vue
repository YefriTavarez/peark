<template>
  <div class="frappe-control" data-fieldtype="Table" data-fieldname="projects">
    <div class="form-group" data-fieldname="projects">
      <div class="clearfix">
        <label class="control-label" style="padding-right: 0px">
          {{ __("Projects") }}
        </label>
      </div>
      <div class="form-grid">
        <div class="grid-heading-row">
          <div class="grid-row">
            <div class="data-row row">
              <div class="row-index sortable-handle col col-xs-1">
                <span class="hidden-xs">...</span>
              </div>
              <div
                class="col grid-static-col col-xs-6"
                data-fieldname="project"
                data-fieldtype="Link"
              >
                <div class="static-area ellipsis">
                  {{ __("Project") }}
                </div>
              </div>
              <div
                class="col grid-static-col col-xs-2"
                data-fieldname="department"
                data-fieldtype="Link"
              >
                <div class="static-area ellipsis">
                  {{ __("Department") }}
                </div>
              </div>
              <div
                class="col grid-static-col col-xs-2"
                data-fieldname="status"
                data-fieldtype="Data"
              >
                <div class="static-area ellipsis">
                  {{ __("Status") }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="grid-body">
          <div class="rows">
            <div
              v-for="(project, index) in project_list"
              v-bind:key="index"
              class="grid-row"
              v-bind:data-name="project.name"
              v-bind:data-idx="project.idx"
            >
              <!-- end row -->
              <div class="data-row row">
                <div class="row-index sortable-handle col col-xs-1">
                  <a href="#" v-on:click.prevent="() => toggle_project_status(project, $event)" class="btn btn-link">
                    <span class="fa fa-check-square-o"  v-show="'Completed' === project.status"></span>
                    <span class="fa fa-square-o"  v-show="'Completed' !== project.status"></span>
                  </a>
                  <span class="hidden-xs">
                    {{ project.idx }}
                  </span>
                </div>
                <div
                  class="col grid-static-col col-xs-6"
                  data-fieldname="project"
                  data-fieldtype="Link"
                >
                  <div class="static-area ellipsis">
                    <a
                      class="grey"
                      v-bind:href="projectHref(project)"
                      data-doctype="Project"
                      v-bind:data-name="project.project"
                    >
                      <strong
                        class="indicator"
                        v-bind:class="{
                          orange: 'Open' == project.status,
                          red: 'Delayed' == project.status,
                          green: 'Completed' == project.status,
                          grey: 'Cancelled' == project.status,
                        }"
                        v-bind:data-name="project.name"
                      >
                        {{ project.project }}: {{ project.project_template }}
                      </strong>
                    </a>
                  </div>
                </div>
                <div
                  class="col grid-static-col col-xs-2"
                  data-fieldname="department"
                  data-fieldtype="Link"
                >
                  <div class="static-area ellipsis">
                    <a
                      class="grey"
                      v-bind:href="departmentHref(project)"
                      data-doctype="Department"
                      v-bind:data-name="project.department"
                    >
                      {{ project.department }}
                    </a>
                  </div>
                </div>
                <div
                  class="col grid-static-col col-xs-2"
                  data-fieldname="status"
                  data-fieldtype="Data"
                >
                  <div class="static-area ellipsis">
                    {{ __(project.status) }}
                  </div>
                </div>
                
                <div class="col col-xs-1">
                  
                </div> 
              </div>
            </div>
            <!-- end row -->
          </div>
          <div
            class="grid-empty text-center"
            v-bind:class="{ hidden: projects.length }"
          >
            {{ __("No Data") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "ProjectTable",
  props: {
    projects: {
      default: new Array(),
    },
    frm: {
      default: null,
    },
  },
  data() {
    return {
      project_list: new Array(),
    };
  },
  methods: {
    departmentHref(opts) {
      const { department } = opts;
      return `#Form/Department/${department}`;
    },
    projectHref(opts) {
      const { project } = opts;
      return `#Form/Project/${project}`;
    },
    toggle_project_status(project, event) {
      let { status } = project;

      if (status === 'Completed') {
        status = 'Open';
      } else {
        status = 'Completed';
      }

      const { target } = event;

      if (target.nodeName === 'SPAN') {
        this.local_toggle(target);
      }

      frappe.call({
        method: 'peark.peark.doctype.project_center.update_subproject_status',
        args: {
          name: project.project,
          status: status,
        },
        callback: ({ message }) => {
          const { status: nstatus } = message;

          if (message) {
            if (nstatus === status) {
              this.update_project_status(project.name, status);  
            } else {
              frappe.show_alert({
                message: __('Project status not updated'),
                indicator: 'orange',
              });
            }

            this.local_toggle(target);
          }
        },
        // always: () => {
        //     console.log("finally");
        // },
        freeze: true,
        error: () => {
          frappe.show_alert({
            message: __('Error'),
            indicator: 'red',
          });
          
          this.local_toggle(target);
        },
      });
    },
    local_toggle(target) {
      target.classList.toggle('fa-check-square-o');
      target.classList.toggle('fa-square-o');
    },
    update_project_status(name, status) {
      this.project_list.find(p => p.name === name).status = status;
      this.update_current_form();
    },
    update_current_form() {
      const { project_list, frm } = this;
      const { doc } = frm;

      if (
        project_list.length 
        && project_list.every(p => p.status === 'Completed')
        && doc.status !== 'Completed'
      ) {
        frm.reload_doc();
      } else if (
        project_list.length 
        && project_list.every(p => p.status === 'Open')
        && doc.status !== 'Open'
      ) {
        frm.reload_doc();
      } else if (
        project_list.length 
        && project_list.some(p => ['Open', 'Completed'].includes(p.status))
        && !['Open', 'Delayed'].includes(doc.status)
      ) {
        frm.reload_doc();
      }
    }
  },
  mounted() {
    this.project_list = this.projects;
  },
};
</script>