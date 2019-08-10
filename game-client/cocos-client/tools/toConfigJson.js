const xlsx = require("node-xlsx");
const fs = require("fs");
var config = {};
var list = xlsx.parse("config.xlsx")
console.log(list)

for(var i = 2; i < list.length; ++i){
    var item = list[i];
    config[item[0]] = item[2];
}

console.log(config);

fs.writeFileSync("../assets/script/share/config.json", config);