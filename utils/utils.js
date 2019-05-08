"use strict";
const TAG = "util/utils.js"
const constant = require('../share/constant');
const crypto = require('crypto');

var utils  = module.exports;

/**
 *@param   str 字符串
 */
utils.md5 = function(str){
    let decipher = crypto.createHash('md5');
    return decipher.update(str).digest('hex');
}

utils.rsaEncode = function(str){
	var sign = crypto.createSign("RSA-MD5");
	sign.update(str);
	return sign.sign(constant.AB_PRIVATE_KEY, "base64");
}

utils.rsaDecode = function(rsaStr, clearCode){
	var verify = crypto.createVerify("RSA-MD5");
	verify.update(clearCode);
	return verify.verify(constant.AB_PUBLIC_KEY, rsaStr, "base64");
}

utils.toArr = function () {
	var arr = []
	for (var key in this) {
		if (typeof this[key] != 'function') {
			arr.push(this[key])
		}
	}
	return arr;
}

utils.toObject = function (obj) {
	var new_obj = {};
	for (var name in obj) {
		if (typeof obj[name] != 'function') {
			new_obj[name] = obj[name]
		}
	}
	return new_obj
}

utils.objectToJson = function (obj) {
	var jsonObj = {};
	for (var name in obj) {
		var type = typeof obj[name];
		if (type !== 'function') {
			if (Object.prototype.toString.call(obj[name]) === "[object Object]"){
				jsonObj[name] = utils.objectToJson(obj[name]);
			}else{
				jsonObj[name] = obj[name];
			}
            // console.log("obj[name]",name,obj[name],new_obj[name]);
		}
	}
	return jsonObj;
}

// callback util
utils.invokeCallback = function (cb) {
	if (!!cb && typeof cb == 'function') {
		cb.apply(null, Array.prototype.slice.call(arguments, 1));
	}
};

//指定长度
utils.rand = function(num) {
	var str = '';
	for (var i = 0; i < num; ++i) {
		str += Math.floor(Math.random() * 10);
	}
	return str;
}

utils.randFirstNotZero = function(num){
	var n = Math.floor(Math.random() * 10);
	if (n == 0){
		return utils.randFirstNotZero(num);
	}
	var str = '' + n;
	for (var i = 1; i < num; ++i) {
		str += Math.floor(Math.random() * 10);
	}
	return str;
}

utils.encodeBase64 = function(content){
	return new Buffer(content).toString('base64');
}

utils.decodeBase64 = function(content){
	return new Buffer(content, 'base64').toString();
}

utils.AddTingType = function( tingtypeArr, cards, tingType ){
	if( !cards || !tingtypeArr ){
		return
	}

	if( (tingtypeArr instanceof  Array) && (cards instanceof Array) ){
		for( let i = 0; i < cards.length; i ++ ){
			let isExist = false;
			for( let j = 0; j < tingtypeArr.length; j ++ ){
				if( (tingtypeArr[j].card == cards[i].privatePoint) && (tingtypeArr[j].type == tingType)	){
					isExist = true;
				}
			}

		if( !isExist ){
			tingtypeArr.push({card:cards[i].privatePoint, type:tingType});
		}
	}
	}
}

// clone a object
utils.clone = function (obj) {
	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) 
		return obj;	
	// Handle Object
	if (obj instanceof Array){
		var copy = [];
		for (var i = 0, len = obj.length; i < len; ++i) {
		  copy[i] = utils.clone(obj[i]);
		}
		return copy;
	}else if (obj instanceof Object) {
	  var copy = {};
	  for (var attr in obj) {
	    if (obj.hasOwnProperty(attr)) 
			copy[attr] = utils.clone(obj[attr]);
	  }
	  return copy;
	}
	throw new Error("Unable to copy obj! Its type isn't supported.");
};


utils.objectSize = function(obj) {
    var count = 0;
    for (var i in obj) {
        if (obj.hasOwnProperty(i) && typeof obj[i] !== 'function') {
            count++;
        }
    }
    return count;
};
// Compare the two arrays and return the difference.
utils.arrayDiff = function(array1, array2){
	var o = {};
	for (var i=0, len = array2.length; i < len; ++i){
		o[array2[i]] = true;
	}
	var result = [];
	for (i = 0, len = array1.length; i < len; ++i){
		var v = array1[i];
		if (o[v]) continue;
		result.push(v);
	}
	return result;
}

utils.hasChineseChar = function(str){
	if (/.*[\u4e00-\u9fa5]+.*$/.test(str)){
		return true;
	} else {
		return false;
	}
};

utils.isObject = function(arg){
	return typeof arg === "object" && arg !== null;
};

utils.generateUniqueId = function(idLen, isExist, next){
    var _genUniqueId = function(){
		var id = utils.rand(idLen);
        isExist(id, function(ret){
			if (ret.code != 0){
				console.log("----------生成唯一Id redis报错, 5秒后重新生成  error:", err);
                return setTimeout(_genUniqueId, 5000);
			}
            if (ret.is){
                _genUniqueId();
            }else{
                return next({code: 0, roomId: id});
            }
        });
    }
    _genUniqueId();
}

utils.generateConnectionCode = function(userId, from, to, roomId){
	return userId+"|"+from+"|"+to +"|"+roomId+"|"+Math.floor(Date.now()*Math.random());
}

utils.delayPromise = function(time){
	return new Promise(function(resolve, reject){
		setTimeout(function(){
			resolve();
		}, time);
	});
}