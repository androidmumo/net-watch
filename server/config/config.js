// 配置文件 config.js

// 基础配置
const baseConfig = {
    port: 8000,
    targets: [
        {
            name: '光猫',
            key: 'gm',
            host: '192.168.1.1',
        },
        {
            name: '网关',
            key: 'wg',
            host: '10.0.24.1',
        },
        {
            name: '谷歌',
            key: 'gg',
            host: 'google.com',
        },
        {
            name: '百度',
            key: 'bd',
            host: 'www.baidu.com',
        },
        {
            name: '雅虎',
            key: 'yh',
            host: 'yahoo.com',
        },
    ]
};

module.exports = {
    baseConfig,
};
