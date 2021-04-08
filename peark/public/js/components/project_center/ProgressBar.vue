<template>
  <div class="progress-bar-wrapper">
    <p>{{ __(label) }}</p>
    <div class="completeness-back">
      <div class="progress completeness" v-width="completedPercentage"></div>
      <strong>{{ percentage }}%</strong>
    </div>
  </div>
</template>

<script>
Vue.directive("width", {
  update: function (el, width, vnode) {
    el.style.width = `${width.value}%`;
  },
  inserted: function (el, width, vnode) {
    el.style.width = `${width.value}%`;
  },
});

export default {
  name: "ProgressBar",
  props: {
    percentage: {
      default: 0,
    },
    label: {
      default: "Progress",
    }
  },
  computed: {
    completedPercentage() {
      return this.percentage ? this.percentage : 1;
    },
  },
};
</script>

<style scoped>
.progress-bar-wrapper {
  position: relative;
}

.completeness-back {
  width: 97%;
  background-color: #ccc;
  border-radius: 3px;
  position: relative;
}

.completeness-back strong {
  position: absolute;
  left: 45%;
  top: 6%;
  color: #fffd;
}

.progress {
  text-align: center;
  padding-top: 6px;
  padding-bottom: 10px;
  color: white;
  height: 23px;
}

.completeness {
  background-color: #3f51b5;
}
</style>