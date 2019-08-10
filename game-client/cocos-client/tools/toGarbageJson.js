const xlsx = require("node-xlsx");
const fs = require("fs");
var garbage = {}
var list = xlsx.parse("card.xlsx")
console.log(list)
var keyItem = list[1];
for (var i = 3; i < list.length; ++i){
    var item = list[i];
    console.log(item.data)
    var temp = {};
    for(var j = 0; j < keyItem.length; ++j){
        temp[keyItem[j]] = item[j];
    }
    garbage[item[0]] = temp;
}
console.log(garbage);

fs.writeFileSync("../assets/script/share/garbage.json", garbage);