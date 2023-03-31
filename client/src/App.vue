<script setup>
import { reactive, computed } from 'vue';
import { getTargets, getHotData, getLongData } from './api/index.js';
import HotDataChart from './components/HotDataChart.vue';
import LongDataChart from './components/LongDataChart.vue';

const state = reactive({
  targets: [],
  hotData: {},
  longData: {},
})

const dataHot = computed(() => {
  return state.hotData[state.targets[0]?.key];
})

const dataLong = computed(() => {
  return state.longData[state.targets[0]?.key];
})

getTargets().then(res => {
  state.targets = res;
})

const getHotDataFn = () => {
  getHotData().then(res => {
    state.hotData = res;
  })
}

const getLongDataFn = () => {
  getLongData().then(res => {
    state.longData = res;
  })
}

getHotDataFn();
getLongDataFn();
setInterval(getHotDataFn, 1000);
setInterval(getLongDataFn, 1000 * 60 * 5);

</script>

<template>
  <div class="hot-data-chart" style="width: 800px;height:300px;">
    <HotDataChart :data="dataHot" />
  </div>
  <div class="long-data-chart" style="width: 800px;height:300px;">
    <LongDataChart :data="dataLong" />
  </div>
</template>

<style scoped></style>
