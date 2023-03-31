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
  const seriesDataMin = (props.data || []).map(item => item.min);
  const seriesDataMax = (props.data || []).map(item => item.max);
  const seriesDataAvg = (props.data || []).map(item => item.avg);
  const xAxisData = (props.data || []).map(item => dayjs(item.timestamp).format('HH:mm:ss'));
  // const xAxisData = (props.data || []).map(item => item.timestamp);
  return {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      top: 30,
      bottom: 20,
      left: 30,
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
        data: seriesDataMax,
        name: '最高',
        type: 'line', // 散点: scatter
        smooth: true, // 平滑
        showSymbol: false, // 是否显示点
        itemStyle: {
          color: '#fda085'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: '#fda085' // 0% 处的颜色
            }, {
              offset: 1, color: '#f6d365' // 100% 处的颜色
            }],
            global: false // 缺省为 false
          },
        },
      },
      {
        data: seriesDataAvg,
        name: '平均',
        type: 'line', // 散点: scatter
        smooth: true, // 平滑
        showSymbol: false, // 是否显示点
        itemStyle: {
          color: '#96e6a1'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: '#96e6a1' // 0% 处的颜色
            }, {
              offset: 1, color: '#d4fc79' // 100% 处的颜色
            }],
            global: false // 缺省为 false
          },
        },
      },
      {
        data: seriesDataMin,
        name: '最低',
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
      },
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
  <div ref="echart" class="echart" style="width:100%;height:100%;"></div>
</template>

<style scoped></style>
