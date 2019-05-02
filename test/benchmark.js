const TAG = "bench.js";
const http = require("http");
const queryString = require("querystring");
const ws = require("ws");
const cluster = require("cluster");

var base = 10000000;
var num = 900;
var errGateCount = 0;
var errLoginCount = 0;
var errCreateCount = 0;

var request = function(url, next){
    var rt = http.request(url, function(res){
        var str = "";
        res.setEncoding("utf-8");
        res.on("data", function(chunk){
            str += chunk;
        }).on("end", function(){
            let data = JSON.parse(str);
            if (!data.errcode)
                data.errcode = 0;
            next(data);
        });
    });
    rt.on("error", function(e){
        console.log("request error", e);
        next({code: 1});
    });
    rt.end();
}

var gate = function(b, i, next){
    let account = b+i;
    var portArr = [8090, 8091];
    var port = portArr[i % portArr.length];
    var url = "http://192.168.10.34:"+ port + "/validateUser?";
    var queryData = {
        accountType: "telnumber",
        accountData: JSON.stringify({account: account})
    };
    url = url + queryString.stringify(queryData);
    request(url, function(ret){
        if (ret.code != 0){
            ++errGateCount;
            return console.log(process.pid, " gate error: ", ret);
        }
        ret.account = account;
        next(ret);
    });
}

var login = function(data, next){
    let url = "http://" + data.ip + ":" + data.port + "/login?";
    var queryData = {
        account: data.account,
        cliType: "pc",
        accountType: "telnumber",
        clientId: 12,
        recommendation: data.recommendation,
        accountData: JSON.stringify({nickname: "", gender: 0, avatarUrl: ""})
    }
    url = url + queryString.stringify(queryData);
    request(url, function(ret){
        if (ret.code != 0){
            ++errLoginCount;
            return console.log(process.pid, "login error: ", ret);;
        }
        ret.ip = data.ip;
        ret.port = data.port;
        next(ret);
    });
}

var createRoom = function(data, next){
    let url = "http://" + data.ip + ":" + data.port + "/createRoom?";
    var queryData = {
        userId: data.userId,
        roomInfo: JSON.stringify({userId: data.userId})
    }
    url = url + queryString.stringify(queryData);
    request(url, function(ret){
        if (ret.code != 0){
            ++errCreateCount;
            return console.log(process.pid, "创建房间失败！error: ", ret);
        }
        var client = new ws("ws://" + ret.ip + ":" + ret.port);
        client.on("close", function(code){
            console.log("socket close !!!");
        });
        client.on("open", function(){
            console.log("socket open !!!");
            next({code: 0});
            setTimeout(function(){
                client.close();
            }, 10000);
        });
        client.on("error", function(err){
            console.log("socket error !!!", err);
        });
        client.on("message", function(data){
            console.log("socket message !!!", data.toString());
        });
    });
}

var bench = function(b, num){
    for (let i = 0; i < num; ++i){
        gate(b, i, function(data){
            console.log("account= ", data.account, " login !!! port: ", data.port);
            login(data, function(ret){
                console.log("account= ", data.account, " logined, userid= ", ret.userId, " 创建房间, port: ", ret.port);
                createRoom(ret, function(r){
                    console.log(r)
                });
            });
        });
    }
}

if (cluster.isMaster) {
    console.log(`主进程 ${process.pid} 正在运行`);
    bench(base, num);
    // 衍生工作进程。
    for (let i = 0; i < 9; i++) {
      cluster.fork();
    }
    setInterval(function(){
        console.log(process.pid, "gate-count: ", errGateCount, "login-count: ", errLoginCount, "create-count: ", errCreateCount);
    }, 60000);
    cluster.on('exit', (worker, code, signal) => {
      console.log(`工作进程 ${worker.process.pid} 已退出`);
    });
  } else {
    console.log(`工作进程 ${process.pid} 已启动`, cluster.worker.id);
    if (cluster.worker.id == 1){
        bench(base + base, num);
        setInterval(function(){
            console.log(process.pid, "gate-count: ", errGateCount, "login-count: ", errLoginCount, "create-count: ", errCreateCount);
        }, 60000);
    }
    else if (cluster.worker.id == 2){
        bench(base*3, num);
        setInterval(function(){
            console.log(process.pid, "gate-count: ", errGateCount, "login-count: ", errLoginCount, "create-count: ", errCreateCount);
        }, 60000);
    }
    else if (cluster.worker.id == 3){
        bench(base*4, num);
        setInterval(function(){
            console.log(process.pid, "gate-count: ", errGateCount, "login-count: ", errLoginCount, "create-count: ", errCreateCount);
        }, 60000);
    }
    else if (cluster.worker.id == 4){
        bench(base*5, num);
        setInterval(function(){
            console.log(process.pid, "gate-count: ", errGateCount, "login-count: ", errLoginCount, "create-count: ", errCreateCount);
        }, 60000);
    }
    else if (cluster.worker.id == 5){
        bench(base*6, num);
        setInterval(function(){
            console.log(process.pid, "gate-count: ", errGateCount, "login-count: ", errLoginCount, "create-count: ", errCreateCount);
        }, 60000);
    }
    else if (cluster.worker.id == 6){
        bench(base*7, num);
        setInterval(function(){
            console.log(process.pid, "gate-count: ", errGateCount, "login-count: ", errLoginCount, "create-count: ", errCreateCount);
        }, 60000);
    }
    else if (cluster.worker.id == 7){
        bench(base*8, num);
        setInterval(function(){
            console.log(process.pid, "gate-count: ", errGateCount, "login-count: ", errLoginCount, "create-count: ", errCreateCount);
        }, 60000);
    }
    else if (cluster.worker.id == 8){
        bench(base*9, num);
        setInterval(function(){
            console.log(process.pid, "gate-count: ", errGateCount, "login-count: ", errLoginCount, "create-count: ", errCreateCount);
        }, 60000);
    }
    else if (cluster.worker.id == 9){
        bench(base*10, num);
        setInterval(function(){
            console.log(process.pid, "gate-count: ", errGateCount, "login-count: ", errLoginCount, "create-count: ", errCreateCount);
        }, 60000);
    }
  }