<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

const props = defineProps({
  target: Object,
  data: Array,
})

const state = reactive({
  myChart: null
})

const echart = ref();

onMounted(() => {
  initEChart();
})

const option = computed(() => {
  const seriesData = (props.data || []).map(item => item.value);
  // const xAxisData = (props.data || []).map(item => dayjs(item.timestamp).format('HH:mm:ss'));
  const xAxisData = (props.data || []).map(item => item.timestamp);
  return {
    xAxis: {
      type: 'time',
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
    },
    series: [
      {
        data: seriesData,
        type: 'line',
        smooth: true, // 平滑
        showSymbol: true, // 是否显示点
        areaStyle: {},
      }
    ]
  };
})

const initEChart = () => {
  // 基于准备好的dom，初始化echarts实例
  state.myChart = echarts.init(echart.value);
}

setInterval(() => {
  // 绘制图表
  state.myChart.setOption(option.value);
}, 1000);

</script>

<template>
  <div ref="echart" class="echart" style="width: 800px;height:600px;"></div>
</template>

<style scoped></style>
