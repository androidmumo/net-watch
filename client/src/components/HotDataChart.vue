<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

const props = defineProps({
  data: Array,
})

// const state = reactive({
//   myChart: null
// })

let chart = {};

const echart = ref();

const option = computed(() => {
  const seriesData = (props.data || []).map(item => item.value);
  const xAxisData = (props.data || []).map(item => dayjs(item.timestamp).format('HH:mm:ss'));
  // const xAxisData = (props.data || []).map(item => item.timestamp);
  return {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      top: 30,
      bottom: 20,
      left: 60,
      right: 0,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      name: '延迟(ms)',
      max: function (value) {
        return value.max <= 5 ? 5 : value.max;
      }
    },
    series: [
      {
        data: seriesData,
        name: '延迟',
        type: 'line', // 散点: scatter
        smooth: true, // 平滑
        showSymbol: false, // 是否显示点
        itemStyle: {
          color: '#1D8FE1'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: '#005bea' // 0% 处的颜色
            }, {
              offset: 1, color: '#00c6fb' // 100% 处的颜色
            }],
            global: false // 缺省为 false
          },
        },
      }
    ]
  };
})

onMounted(() => {
  initEChart();
})

const initEChart = () => {
  // 基于准备好的dom，初始化echarts实例
  chart = echarts.init(echart.value);
}


setInterval(() => {
  // 绘制图表
  chart.setOption(option.value);
}, 1000);

</script>

<template>
  <div ref="echart" class="echart"></div>
</template>

<style lang="scss" scoped>
.echart {
  width: 100%;
  height: 100%;
}
</style>
