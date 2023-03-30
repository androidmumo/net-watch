import http from '../utils/http'

const getTargets = () => {
	return http({
		method: 'get',
		url: '/api/getTargets',
	}).then((response) => response.data)
}

const getHotData = () => {
	return http({
		method: 'get',
		url: '/api/getHotData',
	}).then((response) => response.data)
}

export { getTargets, getHotData }
