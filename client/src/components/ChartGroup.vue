<script setup>
import { reactive, computed } from 'vue';
import { getTargets, getHotData, getLongData } from '../api/index.js';
import HotDataChart from './HotDataChart.vue';
import LongDataChart from './LongDataChart.vue';

const props = defineProps({
  target: Object,
  hotData: Array,
  longData: Array,
})

const state = reactive({
  targets: [],
  hotData: {},
  longData: {},
})

const loss = computed(() => {
  if (!Array.isArray(props.longData)) return 0;
  let sum = 0;
  props.longData.forEach(item => {
    sum += +item.loss;
  })
  let avgLoss = (sum / props.longData.length) || 0;
  avgLoss = Math.round(avgLoss * 100000) / 1000;
  return avgLoss;
})

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
  <div class="chart-group">
    <div class="main card-style">
      <div class="name">{{ target.name }}</div>
      <div class="status" :class="`status-${ loss > 0.1 ? 'bad' : 'good' }`">
        <div class="icon"></div>
        <div class="text">状态{{ loss > 0.1 ? '异常' : '良好' }}</div>
      </div>
      <div class="loss">
        <div class="value">{{ loss }}%</div>
        <div class="text">24H丢包率</div>
      </div>
    </div>
    <div class="hot-data-chart card-style">
      <HotDataChart :data="hotData" />
    </div>
    <div class="long-data-chart card-style">
      <LongDataChart :data="longData" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart-group {
  display: flex;
  align-items: center;
  margin-bottom: 30px;

  .main {
    width: 120px;
    height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-size: 14px;
    padding: 20px 10px;
    margin: 0 10px;
    text-align: center;
    font-size: 14px;
    color: #666;

    .name {
      font-weight: bold;
      margin-bottom: 30px;
      color: #3c3c3c;
    }

    .status {
      display: flex;
      align-items: center;

      .icon {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #000;
        margin-right: 6px;
      }

      margin-bottom: 12px;
    }

    .status-bad {
      .icon {
        background-color: #e94444;
      }
    }

    .status-good {
      .icon {
        background-color: #41cf34;
      }
    }

    .loss {
      .value {
        font-size: 20px;
        font-weight: bold;
        color: #3c3c3c;
      }

      .text {
        margin-top: 6px;
      }
    }
  }

  .hot-data-chart {
    flex: 1;
    height: 200px;
    padding: 20px 10px;
    margin: 0 10px;
  }

  .long-data-chart {
    flex: 1;
    height: 200px;
    padding: 20px 10px;
    margin: 0 10px;
  }

  .card-style {
    background-color: #fff;
    border-radius: 18px;
    box-shadow: 2px 4px 12px rgba(0,0,0,.08);
    transition: all .3s cubic-bezier(0,0,.5,1);
  }

  .card-style:hover {
    box-shadow: 2px 4px 16px rgba(0,0,0,.16);
    transform: scale3d(1.01,1.01,1.01);
  }
}
</style>
