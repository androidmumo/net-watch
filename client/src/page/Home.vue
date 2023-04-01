<script setup>
import { reactive } from 'vue';
import { getTargets, getHotData, getLongData } from '../api/index.js';
import ChartGroup from '../components/ChartGroup.vue';

const state = reactive({
	targets: [],
	hotData: {},
	longData: {},
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
	<div class="home">
		<div class="lable-group">
			<div class="lable">项目</div>
			<div class="lable-5">5分钟</div>
			<div class="lable-24">24小时</div>
		</div>
		<div class="chart-group-wrap" v-for="target in state.targets" :key="target.key">
			<ChartGroup :target="target" :hot-data="state.hotData[target.key]" :long-data="state.longData[target.key]" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.home {
	background-color: #f5f5f5;
	.lable-group {
		display: flex;
		align-items: center;
		font-size: 14px;
		height: 50px;
		text-align: center;

		.lable {
			width: 120px;
			padding: 0 10px;
			margin: 0 10px;
		}

		.lable-5 {
			flex: 1;
		}

		.lable-24 {
			flex: 1;
		}
	}
}
</style>
