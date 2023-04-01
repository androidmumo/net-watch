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

// const dataHot = computed(() => {
//   return state.hotData[state.targets[0]?.key];
// })

// const dataLong = computed(() => {
//   return state.longData[state.targets[0]?.key];
// })

const getTargetsFn = () => {
  getTargets().then(res => {
    state.targets = res;
  })
}

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

getTargetsFn();
getHotDataFn();
getLongDataFn();
setInterval(getHotDataFn, 1000);
setInterval(getLongDataFn, 1000 * 60 * 5);

</script>

<template>
  <div class="chart-group" v-for="target in state.targets" :key="target.key">
    <div class="chart-name">{{ target.name }}</div>
    <div class="hot-data-chart">
      <HotDataChart :data="state.hotData[target.key]" />
    </div>
    <div class="long-data-chart">
      <LongDataChart :data="state.longData[target.key]" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart-group {
  display: flex;
  // justify-content: space-around;
  align-items: center;
  .hot-data-chart {
    flex: 1;
    // width: 40%;
    height: 300px;
  }
  .long-data-chart {
    flex: 1;
    // width: 40%;
    height: 300px;
  }
}
</style>
