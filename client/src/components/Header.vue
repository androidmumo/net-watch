<script setup lang="ts">




</script>

<template>
	<div class="header">
		<div class="header-left">
			NetWatch-网络监测系统
		</div>
		<div class="header-center"></div>
		<div class="header-right">
		</div>
	</div>
</template>

<style scoped lang="scss">
$left-right-margin: 30px; // 左右边距

.header {
	position: fixed;
	z-index: 1;
	top: 0;
	width: 100%;
	height: 60px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	-webkit-backdrop-filter: saturate(180%) blur(20px);
	backdrop-filter: saturate(180%) blur(20px);
	background-color: #fbfbfd83;
	font-size: 14px;
	.header-left {
		display: flex;
		align-items: center;
		margin-left: $left-right-margin;
		.icon {
			margin-right: 10px;
			cursor: pointer;
		}
		.title {
			cursor: pointer;
		}
		.back-btn {
			font-size: 16px;
		}
	}
	.header-center {
		display: flex;
		align-items: center;
	}
	.header-right {
		display: flex;
		align-items: center;
		margin-right: $left-right-margin;
	}
}
</style>
