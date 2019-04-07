const TAG = "bench.js";
const http = require("http");
const queryString = require("querystring");

exports.bench = function(num){
    for (var i = 0; i < num; ++i){
        var url = "http://192.168.10.34:8090/validateUser?";
        var queryData = {
            cliType: "pc",
            accountType: "tel-number",
        };
        url = url + queryString.stringify(queryData);
        var rt = http.request(url, function(res){
            var str = "";
            res.setEncoding("utf-8");
            res.on("data", function(chunk){
                str += chunk;
            }).on("end", function(){
                console.log("end end", str);
                //next ? next({code: errcode.OK, data: JSON.parse(str)}): null;
            });
        });
        rt.on("error", function(e){
            console.log("loginWX error", e);
            //next ? next({code: errcode.FAIL}) : null;
        });
        rt.end();
    }
}