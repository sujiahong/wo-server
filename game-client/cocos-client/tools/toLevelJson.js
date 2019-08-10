const xlsx = require("node-xlsx");
const fs = require("fs");
var level = {};
var list = xlsx.parse("level.xlsx")
console.log(list)

var keyItem = list[1];
var typeItem = list[2];
for (var i = 3; i < list.length; ++i){
    var item = list[i];
    console.log(item.data)
    var temp = {};
    for(var j = 0; j < keyItem.length; ++j){
        if (typeItem[j] == "arrayint"){
            temp[keyItem[j]] = item[j].sqlit(";");
        }else{
            temp[keyItem[j]] = item[j];
        }
    }
    level[item[0]] = temp;
}

console.log(level);

fs.writeFileSync("../assets/script/share/level.json", level);