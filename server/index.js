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

// ------ utils start------
// 获取单个表的数据
const getData = (key) => {
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
            const sqlStr1 = `DROP TABLE ${key}`;
            db.run(sqlStr1);
            const sqlStr2 = `DROP TABLE ${key}_hot`;
            db.run(sqlStr2);
        });
    });
};
// ------ utils end------

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
                LOSS TEXT NOT NULL,
                TIMESTAMP DATETIME DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'LOCALTIME'))
            );
        `;
        db.run(sqlStrHot);
        db.run(sqlStr);
    });
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
const calcFn = () => {
    targets.forEach(target => {
        const { name, key, host } = target;
        getData(`${key}_hot`).then(res => {
            let valueArr = res.row.map(i => i.VALUE).filter(o => o !== 'unalive');
            valueArr.sort((a, b) => a - b);
            let sum = 0;
            valueArr.forEach(valueItem => {
                sum += +valueItem;
            })
            const min = valueArr[0];
            const max = valueArr[valueArr.length - 1];
            const avg = Math.round((sum / valueArr.length) * 1000) / 1000;
            const loss = Math.round((res.row.map(i => i.VALUE).filter(a => a === 'unalive').length / res.row.length) * 1000) / 1000;
            // console.log(min, max, avg, loss);
            db.serialize(() => {
                // 插入数据
                const insertInfo = db.prepare(`insert into ${key} (NAME, HOST, MIN, MAX, AVG, LOSS) values (?, ?, ?, ?, ?, ?)`);
                insertInfo.run(name, host, min, max, avg, loss);
                insertInfo.finalize();
                // 删除过期数据
                const oldDatetime = dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss.SSS');
                const sqlDel = `DELETE FROM ${key} WHERE TIMESTAMP <'${oldDatetime}';`;
                db.run(sqlDel);
            });
        });
    })
};

// 开始任务
const go = () => {
    console.log('任务开始');
    // 检查并创建表
    for (let index = 0; index < targets.length; index++) {
        const target = targets[index];
        const { key } = target;
        createTable(key);
    }

    setInterval(() => {
        // console.log('执行ping');
        targets.forEach(target => {
            pingFn(target);
        });
    }, 1000);

    setInterval(() => {
        calcFn();
    }, 1000 * 60 * 5);
}

setTimeout(go, 5000);
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
        jobArr.push(getData(`${key}_hot`));
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
});

// 获取所有长数据
app.get(`/api/getLongData`, (req, res) => {
    const jobArr = [];
    targets.forEach(target => {
        const { key } = target;
        jobArr.push(getData(`${key}`));
    });
    Promise.all(jobArr).then(resArr => {
        const data = {};
        resArr.forEach(item => {
            data[item.key] = item.row.map(rowItem => {
                return {
                    id: rowItem.ID,
                    min: rowItem.MIN,
                    max: rowItem.MAX,
                    avg: rowItem.AVG,
                    loss: rowItem.LOSS,
                    timestamp: rowItem.TIMESTAMP,
                }
            });
        })
        res.send(data);
    }).catch(err => {
        res.send(err);
    })
});
// ------ 接口 end------

// 开始监听
app.listen(port, () => {
    console.log(`api listening at http://localhost:${port}`);
});
