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
                <span class="hidden-xs">&nbsp;</span>
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
              v-for="(project, index) in projects"
              v-bind:key="index"
              class="grid-row"
              v-bind:data-name="project.name"
              v-bind:data-idx="project.idx"
            >
              <!-- end row -->
              <div class="data-row row">
                <div class="row-index sortable-handle col col-xs-1">
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
                <div class="col col-xs-1 hidden">
                  <a class="close btn-open-row">
                    <span class="octicon octicon-triangle-down"></span>
                  </a>
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
  },
};
</script>