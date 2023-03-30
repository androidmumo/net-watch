<script setup>
import { reactive, computed } from 'vue';
import EChart from './components/EChart.vue';
import { getTargets, getHotData } from './api/index.js';

const state = reactive({
  targets: [],
  hotData: {},
})

const target = computed(() => {
  return state.targets[0];
})

const data = computed(() => {
  return state.hotData[state.targets[0]?.key];
})

getTargets().then(res => {
  state.targets = res;
})



setInterval(() => {
  getHotData().then(res => {
    state.hotData = res;
  })
}, 1000);

</script>

<template>
  <EChart :target="target" :data="data" />
</template>

<style scoped></style>
