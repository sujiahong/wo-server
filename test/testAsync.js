
var id = 0;
var idMap = {};
setInterval(function(){
    ++id;
    if (!idMap[id]){
        idMap[id] = 1;
    }else{
        console.log("appear 111 ", id);
    }
}, 2);

setInterval(function(){
    ++id;
    if (!idMap[id]){
        idMap[id] = 1;
    }else{
        console.log("appear 333 ", id);
    }
}, 3);

setInterval(function(){
    ++id;
    if (!idMap[id]){
        idMap[id] = 1;
    }else{
        console.log("appear 222 ", id);
    }
}, 1);

setInterval(function(){
    ++id;
    if (!idMap[id]){
        idMap[id] = 1;
    }else{
        console.log("appear 222 ", id);
    }
}, 1);

setInterval(function(){
    ++id;
    if (!idMap[id]){
        idMap[id] = 1;
    }else{
        console.log("appear 222 ", id);
    }
}, 1);

var o = {
    _kkk: 12,
    __dirtyStat: false,
}
Object.defineProperty(o, "kkk", {
    get: function(){
        console.log("111111")
        return this._kkk;
    },
    set: function(val){
        console.log("222222")
        this._kkk = val;
    },
    __dirtyStat: false,
})
console.log(o.kkk)
o.kkk = 344;
console.log(o.kkk, o.kkk.__dirtyStat)
var d =  Object.getOwnPropertyDescriptor(o, "_kkk");
d.__dirtyStat = false;
console.log(d, Object.getOwnPropertyDescriptor(o, "_kkk"));