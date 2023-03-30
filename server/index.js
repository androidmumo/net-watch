// 导入配置文件
const {
    baseConfig,
} = require("./config/config");

// 初始化配置项
const { port, targets } = baseConfig;

// 原生模块
const childProcess = require("child_process");
const path = require('path');

// 第三方模块
const cors = require("cors");
const ping = require('ping');
const sqlite3 = require('sqlite3');
const dayjs = require('dayjs');

// 使用express框架
const express = require("express");
const { readFile } = require("fs");
const app = new express();

// ------ 逻辑代码 start------
// 初始化SQLite
let db = null;
const initSQLite = () => {
    let rootPath = path.join(__dirname, './db/sqlite3.db');
    db = new sqlite3.Database(rootPath, (err) => {
        if (err) throw err;
        console.log('数据库连接')
    })
}
initSQLite();

// 检查表是否存在
const checkTableExists = (key) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.each(`SELECT count(*) FROM sqlite_master WHERE type="table" AND name = "${key}";`, (err, row) => {
                resolve(!!row['count(*)'])
            });
        })
    })
}

// 创建表
const createTable = (key) => {
    db.serialize(() => {
        const sqlStrHot = `
            CREATE TABLE IF NOT EXISTS ${key}_hot
            (
                ID integer PRIMARY KEY AUTOINCREMENT,
                NAME TEXT NOT NULL,
                HOST TEXT NOT NULL,
                VALUE TEXT NOT NULL,
                NUMERIC_HOST TEXT NOT NULL,
                TIMESTAMP DATETIME DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'LOCALTIME'))
            );
        `;
        const sqlStr = `
            CREATE TABLE IF NOT EXISTS ${key}
            (
                ID integer PRIMARY KEY AUTOINCREMENT,
                NAME TEXT NOT NULL,
                HOST TEXT NOT NULL,
                MIN TEXT NOT NULL,
                MAX TEXT NOT NULL,
                AVG TEXT NOT NULL,
                NUMERIC_HOST TEXT NOT NULL,
                TIMESTAMP DATETIME DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'LOCALTIME'))
            );
        `;
        db.run(sqlStrHot);
        db.run(sqlStr);
    });
}
for (let index = 0; index < targets.length; index++) {
    const target = targets[index];
    const { key } = target;
    createTable(key);
}

// 执行ping
const pingFn = async (target) => {
    const { name, key, host } = target;
    const res = await ping.promise.probe(host);
    const value = res.avg === 'unknown' ? 'unalive' : res.avg;
    db.serialize(() => {
        // 插入数据
        const insertInfo = db.prepare(`insert into ${key}_hot (NAME, HOST, VALUE, NUMERIC_HOST) values (?, ?, ?, ?)`);
        insertInfo.run(name, host, value, res.numeric_host);
        insertInfo.finalize();
        // 删除过期数据
        const oldDatetime = dayjs().subtract(5, 'minute').format('YYYY-MM-DD HH:mm:ss.SSS');
        const sqlDel = `DELETE FROM ${key}_hot WHERE TIMESTAMP <'${oldDatetime}';`;
        db.run(sqlDel);
    });
}

// 计算
const calcFn = () => { }

// 遍历任务
const go = () => {
    console.log('任务开始');
    setInterval(() => {
        // console.log('执行ping');
        targets.forEach(target => {
            pingFn(target)
        })
    }, 1000);
}

setTimeout(go, 5000);

// pingFn(targets[0])

// 获取单个表的热数据(5分钟)
const getHotData = (key) => {
    return new Promise((resolve, reject) => {
        const sqlStr = `SELECT * FROM ${key};`;
        db.serialize(() => {
            db.all(sqlStr, (err, row) => {
                if (err) reject({ key, err });
                resolve({ key, row });
            });
        })
    })
};

// 删除表
const deleteTable = () => {
    targets.forEach(target => {
        db.serialize(() => {
            const { key } = target;
            const sqlStr = `DROP TABLE ${key}`;
            db.run(sqlStr);
        });
    });
};
// deleteTable();
// ------ 逻辑代码 end------

// ------ 接口 start------
// 跨域
app.use(cors());

const distPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(distPath));

app.get('/', (req, res) => {
    res.sendfile(`${distPath}/index.html`);
})

// 获取目标信息
app.get('/api/getTargets', (req, res) => {
    res.send(targets);
})

// 获取所有热数据
app.get(`/api/getHotData`, (req, res) => {
    // console.log(req.query);
    const jobArr = [];
    targets.forEach(target => {
        const { key } = target;
        jobArr.push(getHotData(`${key}_hot`));
    });
    Promise.all(jobArr).then(resArr => {
        const data = {};
        resArr.forEach(item => {
            data[item.key.split('_')[0]] = item.row.map(rowItem => {
                return {
                    id: rowItem.ID,
                    value: rowItem.VALUE,
                    timestamp: rowItem.TIMESTAMP,
                }
            });
        })
        res.send(data);
    }).catch(err => {
        res.send(err);
    })
}); // 获取图片列表
// ------ 接口 end------

// 开始监听
app.listen(port, () => {
    console.log(`api listening at http://localhost:${port}`);
});
