const TAG = "bench.js";
const http = require("http");
const queryString = require("querystring");
const ws = require("ws");

var request = function(url, next){
    var rt = http.request(url, function(res){
        var str = "";
        res.setEncoding("utf-8");
        res.on("data", function(chunk){
            str += chunk;
        }).on("end", function(){
            var data = JSON.parse(str);
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

var gate = function(i, next){
    let account = 10000000+i;
    var url = "http://192.168.10.34:8090/validateUser?";
    var queryData = {
        accountType: "telnumber",
        accountData: JSON.stringify({account: account})
    };
    url = url + queryString.stringify(queryData);
    request(url, function(ret){
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
            return console.log("创建房间失败！", data);
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
            }, 3000);
        });
        client.on("error", function(err){
            console.log("socket error !!!", err);
        });
        client.on("message", function(data){
            console.log("socket message !!!", data.toString());
        });
    });
}

var bench = function(num){
    for (let i = 0; i < num; ++i){
        gate(i, function(data){
            if (data.code != 0){
                return console.log("gate error: ", data);
            }
            login(data, function(ret){
                if (ret.code != 0){
                    return console.log("login error: ", ret);
                }
                createRoom(ret, function(){

                });
            });
        });
    }
}

bench(5000);