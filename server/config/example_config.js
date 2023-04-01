// 配置文件 config.js

// 基础配置
const baseConfig = {
	host: 'http://localhost',
    port: 8000,
    targets: [
        {
            name: '光猫',
            key: 'gm',
            host: '192.168.1.1',
        },
        {
            name: '路由器',
            key: 'lyq',
            host: '192.168.2.1',
        },
        {
            name: '百度',
            key: 'bd',
            host: 'www.baidu.com',
        },
    ]
};

module.exports = {
    baseConfig,
};

export { baseConfig };
