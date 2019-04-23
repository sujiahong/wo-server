window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  1: [ function(require, module, exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = "undefined" !== typeof Uint8Array ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len = b64.length;
      if (len % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
      var validLen = b64.indexOf("=");
      -1 === validLen && (validLen = len);
      var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
      return [ validLen, placeHoldersLen ];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return 3 * (validLen + placeHoldersLen) / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return 3 * (validLen + placeHoldersLen) / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
      for (var i = 0; i < len; i += 4) {
        tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = 255 & tmp;
      }
      if (2 === placeHoldersLen) {
        tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
        arr[curByte++] = 255 & tmp;
      }
      if (1 === placeHoldersLen) {
        tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = 255 & tmp;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[63 & num];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (255 & uint8[i + 2]);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
      if (1 === extraBytes) {
        tmp = uint8[len - 1];
        parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
      } else if (2 === extraBytes) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
      }
      return parts.join("");
    }
  }, {} ],
  2: [ function(require, module, exports) {
    (function(global) {
      "use strict";
      var base64 = require("base64-js");
      var ieee754 = require("ieee754");
      var isArray = require("isarray");
      exports.Buffer = Buffer;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      Buffer.TYPED_ARRAY_SUPPORT = void 0 !== global.TYPED_ARRAY_SUPPORT ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();
      exports.kMaxLength = kMaxLength();
      function typedArraySupport() {
        try {
          var arr = new Uint8Array(1);
          arr.__proto__ = {
            __proto__: Uint8Array.prototype,
            foo: function() {
              return 42;
            }
          };
          return 42 === arr.foo() && "function" === typeof arr.subarray && 0 === arr.subarray(1, 1).byteLength;
        } catch (e) {
          return false;
        }
      }
      function kMaxLength() {
        return Buffer.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
      }
      function createBuffer(that, length) {
        if (kMaxLength() < length) throw new RangeError("Invalid typed array length");
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          that = new Uint8Array(length);
          that.__proto__ = Buffer.prototype;
        } else {
          null === that && (that = new Buffer(length));
          that.length = length;
        }
        return that;
      }
      function Buffer(arg, encodingOrOffset, length) {
        if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) return new Buffer(arg, encodingOrOffset, length);
        if ("number" === typeof arg) {
          if ("string" === typeof encodingOrOffset) throw new Error("If encoding is specified then the first argument must be a string");
          return allocUnsafe(this, arg);
        }
        return from(this, arg, encodingOrOffset, length);
      }
      Buffer.poolSize = 8192;
      Buffer._augment = function(arr) {
        arr.__proto__ = Buffer.prototype;
        return arr;
      };
      function from(that, value, encodingOrOffset, length) {
        if ("number" === typeof value) throw new TypeError('"value" argument must not be a number');
        if ("undefined" !== typeof ArrayBuffer && value instanceof ArrayBuffer) return fromArrayBuffer(that, value, encodingOrOffset, length);
        if ("string" === typeof value) return fromString(that, value, encodingOrOffset);
        return fromObject(that, value);
      }
      Buffer.from = function(value, encodingOrOffset, length) {
        return from(null, value, encodingOrOffset, length);
      };
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        Buffer.prototype.__proto__ = Uint8Array.prototype;
        Buffer.__proto__ = Uint8Array;
        "undefined" !== typeof Symbol && Symbol.species && Buffer[Symbol.species] === Buffer && Object.defineProperty(Buffer, Symbol.species, {
          value: null,
          configurable: true
        });
      }
      function assertSize(size) {
        if ("number" !== typeof size) throw new TypeError('"size" argument must be a number');
        if (size < 0) throw new RangeError('"size" argument must not be negative');
      }
      function alloc(that, size, fill, encoding) {
        assertSize(size);
        if (size <= 0) return createBuffer(that, size);
        if (void 0 !== fill) return "string" === typeof encoding ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
        return createBuffer(that, size);
      }
      Buffer.alloc = function(size, fill, encoding) {
        return alloc(null, size, fill, encoding);
      };
      function allocUnsafe(that, size) {
        assertSize(size);
        that = createBuffer(that, size < 0 ? 0 : 0 | checked(size));
        if (!Buffer.TYPED_ARRAY_SUPPORT) for (var i = 0; i < size; ++i) that[i] = 0;
        return that;
      }
      Buffer.allocUnsafe = function(size) {
        return allocUnsafe(null, size);
      };
      Buffer.allocUnsafeSlow = function(size) {
        return allocUnsafe(null, size);
      };
      function fromString(that, string, encoding) {
        "string" === typeof encoding && "" !== encoding || (encoding = "utf8");
        if (!Buffer.isEncoding(encoding)) throw new TypeError('"encoding" must be a valid string encoding');
        var length = 0 | byteLength(string, encoding);
        that = createBuffer(that, length);
        var actual = that.write(string, encoding);
        actual !== length && (that = that.slice(0, actual));
        return that;
      }
      function fromArrayLike(that, array) {
        var length = array.length < 0 ? 0 : 0 | checked(array.length);
        that = createBuffer(that, length);
        for (var i = 0; i < length; i += 1) that[i] = 255 & array[i];
        return that;
      }
      function fromArrayBuffer(that, array, byteOffset, length) {
        array.byteLength;
        if (byteOffset < 0 || array.byteLength < byteOffset) throw new RangeError("'offset' is out of bounds");
        if (array.byteLength < byteOffset + (length || 0)) throw new RangeError("'length' is out of bounds");
        array = void 0 === byteOffset && void 0 === length ? new Uint8Array(array) : void 0 === length ? new Uint8Array(array, byteOffset) : new Uint8Array(array, byteOffset, length);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          that = array;
          that.__proto__ = Buffer.prototype;
        } else that = fromArrayLike(that, array);
        return that;
      }
      function fromObject(that, obj) {
        if (Buffer.isBuffer(obj)) {
          var len = 0 | checked(obj.length);
          that = createBuffer(that, len);
          if (0 === that.length) return that;
          obj.copy(that, 0, 0, len);
          return that;
        }
        if (obj) {
          if ("undefined" !== typeof ArrayBuffer && obj.buffer instanceof ArrayBuffer || "length" in obj) {
            if ("number" !== typeof obj.length || isnan(obj.length)) return createBuffer(that, 0);
            return fromArrayLike(that, obj);
          }
          if ("Buffer" === obj.type && isArray(obj.data)) return fromArrayLike(that, obj.data);
        }
        throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
      }
      function checked(length) {
        if (length >= kMaxLength()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength().toString(16) + " bytes");
        return 0 | length;
      }
      function SlowBuffer(length) {
        +length != length && (length = 0);
        return Buffer.alloc(+length);
      }
      Buffer.isBuffer = function isBuffer(b) {
        return !!(null != b && b._isBuffer);
      };
      Buffer.compare = function compare(a, b) {
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) throw new TypeError("Arguments must be Buffers");
        if (a === b) return 0;
        var x = a.length;
        var y = b.length;
        for (var i = 0, len = Math.min(x, y); i < len; ++i) if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
         case "hex":
         case "utf8":
         case "utf-8":
         case "ascii":
         case "latin1":
         case "binary":
         case "base64":
         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return true;

         default:
          return false;
        }
      };
      Buffer.concat = function concat(list, length) {
        if (!isArray(list)) throw new TypeError('"list" argument must be an Array of Buffers');
        if (0 === list.length) return Buffer.alloc(0);
        var i;
        if (void 0 === length) {
          length = 0;
          for (i = 0; i < list.length; ++i) length += list[i].length;
        }
        var buffer = Buffer.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (!Buffer.isBuffer(buf)) throw new TypeError('"list" argument must be an Array of Buffers');
          buf.copy(buffer, pos);
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer.isBuffer(string)) return string.length;
        if ("undefined" !== typeof ArrayBuffer && "function" === typeof ArrayBuffer.isView && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) return string.byteLength;
        "string" !== typeof string && (string = "" + string);
        var len = string.length;
        if (0 === len) return 0;
        var loweredCase = false;
        for (;;) switch (encoding) {
         case "ascii":
         case "latin1":
         case "binary":
          return len;

         case "utf8":
         case "utf-8":
         case void 0:
          return utf8ToBytes(string).length;

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return 2 * len;

         case "hex":
          return len >>> 1;

         case "base64":
          return base64ToBytes(string).length;

         default:
          if (loweredCase) return utf8ToBytes(string).length;
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
        }
      }
      Buffer.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        var loweredCase = false;
        (void 0 === start || start < 0) && (start = 0);
        if (start > this.length) return "";
        (void 0 === end || end > this.length) && (end = this.length);
        if (end <= 0) return "";
        end >>>= 0;
        start >>>= 0;
        if (end <= start) return "";
        encoding || (encoding = "utf8");
        while (true) switch (encoding) {
         case "hex":
          return hexSlice(this, start, end);

         case "utf8":
         case "utf-8":
          return utf8Slice(this, start, end);

         case "ascii":
          return asciiSlice(this, start, end);

         case "latin1":
         case "binary":
          return latin1Slice(this, start, end);

         case "base64":
          return base64Slice(this, start, end);

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return utf16leSlice(this, start, end);

         default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase();
          loweredCase = true;
        }
      }
      Buffer.prototype._isBuffer = true;
      function swap(b, n, m) {
        var i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer.prototype.swap16 = function swap16() {
        var len = this.length;
        if (len % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
        for (var i = 0; i < len; i += 2) swap(this, i, i + 1);
        return this;
      };
      Buffer.prototype.swap32 = function swap32() {
        var len = this.length;
        if (len % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer.prototype.swap64 = function swap64() {
        var len = this.length;
        if (len % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer.prototype.toString = function toString() {
        var length = 0 | this.length;
        if (0 === length) return "";
        if (0 === arguments.length) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer.prototype.equals = function equals(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return 0 === Buffer.compare(this, b);
      };
      Buffer.prototype.inspect = function inspect() {
        var str = "";
        var max = exports.INSPECT_MAX_BYTES;
        if (this.length > 0) {
          str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
          this.length > max && (str += " ... ");
        }
        return "<Buffer " + str + ">";
      };
      Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (!Buffer.isBuffer(target)) throw new TypeError("Argument must be a Buffer");
        void 0 === start && (start = 0);
        void 0 === end && (end = target ? target.length : 0);
        void 0 === thisStart && (thisStart = 0);
        void 0 === thisEnd && (thisEnd = this.length);
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) throw new RangeError("out of range index");
        if (thisStart >= thisEnd && start >= end) return 0;
        if (thisStart >= thisEnd) return -1;
        if (start >= end) return 1;
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        var x = thisEnd - thisStart;
        var y = end - start;
        var len = Math.min(x, y);
        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);
        for (var i = 0; i < len; ++i) if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (0 === buffer.length) return -1;
        if ("string" === typeof byteOffset) {
          encoding = byteOffset;
          byteOffset = 0;
        } else byteOffset > 2147483647 ? byteOffset = 2147483647 : byteOffset < -2147483648 && (byteOffset = -2147483648);
        byteOffset = +byteOffset;
        isNaN(byteOffset) && (byteOffset = dir ? 0 : buffer.length - 1);
        byteOffset < 0 && (byteOffset = buffer.length + byteOffset);
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (!dir) return -1;
          byteOffset = 0;
        }
        "string" === typeof val && (val = Buffer.from(val, encoding));
        if (Buffer.isBuffer(val)) {
          if (0 === val.length) return -1;
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        }
        if ("number" === typeof val) {
          val &= 255;
          if (Buffer.TYPED_ARRAY_SUPPORT && "function" === typeof Uint8Array.prototype.indexOf) return dir ? Uint8Array.prototype.indexOf.call(buffer, val, byteOffset) : Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        var indexSize = 1;
        var arrLength = arr.length;
        var valLength = val.length;
        if (void 0 !== encoding) {
          encoding = String(encoding).toLowerCase();
          if ("ucs2" === encoding || "ucs-2" === encoding || "utf16le" === encoding || "utf-16le" === encoding) {
            if (arr.length < 2 || val.length < 2) return -1;
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i) {
          return 1 === indexSize ? buf[i] : buf.readUInt16BE(i * indexSize);
        }
        var i;
        if (dir) {
          var foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) if (read(arr, i) === read(val, -1 === foundIndex ? 0 : i - foundIndex)) {
            -1 === foundIndex && (foundIndex = i);
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            -1 !== foundIndex && (i -= i - foundIndex);
            foundIndex = -1;
          }
        } else {
          byteOffset + valLength > arrLength && (byteOffset = arrLength - valLength);
          for (i = byteOffset; i >= 0; i--) {
            var found = true;
            for (var j = 0; j < valLength; j++) if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
        return -1 !== this.indexOf(val, byteOffset, encoding);
      };
      Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        var remaining = buf.length - offset;
        if (length) {
          length = Number(length);
          length > remaining && (length = remaining);
        } else length = remaining;
        var strLen = string.length;
        if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
        length > strLen / 2 && (length = strLen / 2);
        for (var i = 0; i < length; ++i) {
          var parsed = parseInt(string.substr(2 * i, 2), 16);
          if (isNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function latin1Write(buf, string, offset, length) {
        return asciiWrite(buf, string, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer.prototype.write = function write(string, offset, length, encoding) {
        if (void 0 === offset) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (void 0 === length && "string" === typeof offset) {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else {
          if (!isFinite(offset)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
          offset |= 0;
          if (isFinite(length)) {
            length |= 0;
            void 0 === encoding && (encoding = "utf8");
          } else {
            encoding = length;
            length = void 0;
          }
        }
        var remaining = this.length - offset;
        (void 0 === length || length > remaining) && (length = remaining);
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) throw new RangeError("Attempt to write outside buffer bounds");
        encoding || (encoding = "utf8");
        var loweredCase = false;
        for (;;) switch (encoding) {
         case "hex":
          return hexWrite(this, string, offset, length);

         case "utf8":
         case "utf-8":
          return utf8Write(this, string, offset, length);

         case "ascii":
          return asciiWrite(this, string, offset, length);

         case "latin1":
         case "binary":
          return latin1Write(this, string, offset, length);

         case "base64":
          return base64Write(this, string, offset, length);

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return ucs2Write(this, string, offset, length);

         default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
        }
      };
      Buffer.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        return 0 === start && end === buf.length ? base64.fromByteArray(buf) : base64.fromByteArray(buf.slice(start, end));
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        var res = [];
        var i = start;
        while (i < end) {
          var firstByte = buf[i];
          var codePoint = null;
          var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
             case 1:
              firstByte < 128 && (codePoint = firstByte);
              break;

             case 2:
              secondByte = buf[i + 1];
              if (128 === (192 & secondByte)) {
                tempCodePoint = (31 & firstByte) << 6 | 63 & secondByte;
                tempCodePoint > 127 && (codePoint = tempCodePoint);
              }
              break;

             case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if (128 === (192 & secondByte) && 128 === (192 & thirdByte)) {
                tempCodePoint = (15 & firstByte) << 12 | (63 & secondByte) << 6 | 63 & thirdByte;
                tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343) && (codePoint = tempCodePoint);
              }
              break;

             case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if (128 === (192 & secondByte) && 128 === (192 & thirdByte) && 128 === (192 & fourthByte)) {
                tempCodePoint = (15 & firstByte) << 18 | (63 & secondByte) << 12 | (63 & thirdByte) << 6 | 63 & fourthByte;
                tempCodePoint > 65535 && tempCodePoint < 1114112 && (codePoint = tempCodePoint);
              }
            }
          }
          if (null === codePoint) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | 1023 & codePoint;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        var len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, codePoints);
        var res = "";
        var i = 0;
        while (i < len) res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
        return res;
      }
      function asciiSlice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) ret += String.fromCharCode(127 & buf[i]);
        return ret;
      }
      function latin1Slice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) ret += String.fromCharCode(buf[i]);
        return ret;
      }
      function hexSlice(buf, start, end) {
        var len = buf.length;
        (!start || start < 0) && (start = 0);
        (!end || end < 0 || end > len) && (end = len);
        var out = "";
        for (var i = start; i < end; ++i) out += toHex(buf[i]);
        return out;
      }
      function utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end);
        var res = "";
        for (var i = 0; i < bytes.length; i += 2) res += String.fromCharCode(bytes[i] + 256 * bytes[i + 1]);
        return res;
      }
      Buffer.prototype.slice = function slice(start, end) {
        var len = this.length;
        start = ~~start;
        end = void 0 === end ? len : ~~end;
        if (start < 0) {
          start += len;
          start < 0 && (start = 0);
        } else start > len && (start = len);
        if (end < 0) {
          end += len;
          end < 0 && (end = 0);
        } else end > len && (end = len);
        end < start && (end = start);
        var newBuf;
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          newBuf = this.subarray(start, end);
          newBuf.__proto__ = Buffer.prototype;
        } else {
          var sliceLen = end - start;
          newBuf = new Buffer(sliceLen, void 0);
          for (var i = 0; i < sliceLen; ++i) newBuf[i] = this[i + start];
        }
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
        return val;
      };
      Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset + --byteLength];
        var mul = 1;
        while (byteLength > 0 && (mul *= 256)) val += this[offset + --byteLength] * mul;
        return val;
      };
      Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        noAssert || checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + 16777216 * this[offset + 3];
      };
      Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return 16777216 * this[offset] + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
        mul *= 128;
        val >= mul && (val -= Math.pow(2, 8 * byteLength));
        return val;
      };
      Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var i = byteLength;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 256)) val += this[offset + --i] * mul;
        mul *= 128;
        val >= mul && (val -= Math.pow(2, 8 * byteLength));
        return val;
      };
      Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
        noAssert || checkOffset(offset, 1, this.length);
        if (!(128 & this[offset])) return this[offset];
        return -1 * (255 - this[offset] + 1);
      };
      Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return 32768 & val ? 4294901760 | val : val;
      };
      Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return 32768 & val ? 4294901760 | val : val;
      };
      Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        noAssert || checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        noAssert || checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        byteLength |= 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }
        var mul = 1;
        var i = 0;
        this[offset] = 255 & value;
        while (++i < byteLength && (mul *= 256)) this[offset + i] = value / mul & 255;
        return offset + byteLength;
      };
      Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        byteLength |= 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }
        var i = byteLength - 1;
        var mul = 1;
        this[offset + i] = 255 & value;
        while (--i >= 0 && (mul *= 256)) this[offset + i] = value / mul & 255;
        return offset + byteLength;
      };
      Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 1, 255, 0);
        Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value));
        this[offset] = 255 & value;
        return offset + 1;
      };
      function objectWriteUInt16(buf, value, offset, littleEndian) {
        value < 0 && (value = 65535 + value + 1);
        for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> 8 * (littleEndian ? i : 1 - i);
      }
      Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
        } else objectWriteUInt16(this, value, offset, true);
        return offset + 2;
      };
      Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = 255 & value;
        } else objectWriteUInt16(this, value, offset, false);
        return offset + 2;
      };
      function objectWriteUInt32(buf, value, offset, littleEndian) {
        value < 0 && (value = 4294967295 + value + 1);
        for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) buf[offset + i] = value >>> 8 * (littleEndian ? i : 3 - i) & 255;
      }
      Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset + 3] = value >>> 24;
          this[offset + 2] = value >>> 16;
          this[offset + 1] = value >>> 8;
          this[offset] = 255 & value;
        } else objectWriteUInt32(this, value, offset, true);
        return offset + 4;
      };
      Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = 255 & value;
        } else objectWriteUInt32(this, value, offset, false);
        return offset + 4;
      };
      Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);
          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }
        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = 255 & value;
        while (++i < byteLength && (mul *= 256)) {
          value < 0 && 0 === sub && 0 !== this[offset + i - 1] && (sub = 1);
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength;
      };
      Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);
          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }
        var i = byteLength - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = 255 & value;
        while (--i >= 0 && (mul *= 256)) {
          value < 0 && 0 === sub && 0 !== this[offset + i + 1] && (sub = 1);
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength;
      };
      Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 1, 127, -128);
        Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value));
        value < 0 && (value = 255 + value + 1);
        this[offset] = 255 & value;
        return offset + 1;
      };
      Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
        } else objectWriteUInt16(this, value, offset, true);
        return offset + 2;
      };
      Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = 255 & value;
        } else objectWriteUInt16(this, value, offset, false);
        return offset + 2;
      };
      Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
          this[offset + 2] = value >>> 16;
          this[offset + 3] = value >>> 24;
        } else objectWriteUInt32(this, value, offset, true);
        return offset + 4;
      };
      Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
        value < 0 && (value = 4294967295 + value + 1);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = 255 & value;
        } else objectWriteUInt32(this, value, offset, false);
        return offset + 4;
      };
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        noAssert || checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38);
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        noAssert || checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308);
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer.prototype.copy = function copy(target, targetStart, start, end) {
        start || (start = 0);
        end || 0 === end || (end = this.length);
        targetStart >= target.length && (targetStart = target.length);
        targetStart || (targetStart = 0);
        end > 0 && end < start && (end = start);
        if (end === start) return 0;
        if (0 === target.length || 0 === this.length) return 0;
        if (targetStart < 0) throw new RangeError("targetStart out of bounds");
        if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        end > this.length && (end = this.length);
        target.length - targetStart < end - start && (end = target.length - targetStart + start);
        var len = end - start;
        var i;
        if (this === target && start < targetStart && targetStart < end) for (i = len - 1; i >= 0; --i) target[i + targetStart] = this[i + start]; else if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) for (i = 0; i < len; ++i) target[i + targetStart] = this[i + start]; else Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
        return len;
      };
      Buffer.prototype.fill = function fill(val, start, end, encoding) {
        if ("string" === typeof val) {
          if ("string" === typeof start) {
            encoding = start;
            start = 0;
            end = this.length;
          } else if ("string" === typeof end) {
            encoding = end;
            end = this.length;
          }
          if (1 === val.length) {
            var code = val.charCodeAt(0);
            code < 256 && (val = code);
          }
          if (void 0 !== encoding && "string" !== typeof encoding) throw new TypeError("encoding must be a string");
          if ("string" === typeof encoding && !Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
        } else "number" === typeof val && (val &= 255);
        if (start < 0 || this.length < start || this.length < end) throw new RangeError("Out of range index");
        if (end <= start) return this;
        start >>>= 0;
        end = void 0 === end ? this.length : end >>> 0;
        val || (val = 0);
        var i;
        if ("number" === typeof val) for (i = start; i < end; ++i) this[i] = val; else {
          var bytes = Buffer.isBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
          var len = bytes.length;
          for (i = 0; i < end - start; ++i) this[i + start] = bytes[i % len];
        }
        return this;
      };
      var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = stringtrim(str).replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) str += "=";
        return str;
      }
      function stringtrim(str) {
        if (str.trim) return str.trim();
        return str.replace(/^\s+|\s+$/g, "");
      }
      function toHex(n) {
        if (n < 16) return "0" + n.toString(16);
        return n.toString(16);
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        var codePoint;
        var length = string.length;
        var leadSurrogate = null;
        var bytes = [];
        for (var i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                (units -= 3) > -1 && bytes.push(239, 191, 189);
                continue;
              }
              if (i + 1 === length) {
                (units -= 3) > -1 && bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              (units -= 3) > -1 && bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = 65536 + (leadSurrogate - 55296 << 10 | codePoint - 56320);
          } else leadSurrogate && (units -= 3) > -1 && bytes.push(239, 191, 189);
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 6 | 192, 63 & codePoint | 128);
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
          } else {
            if (!(codePoint < 1114112)) throw new Error("Invalid code point");
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
          }
        }
        return bytes;
      }
      function asciiToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) byteArray.push(255 & str.charCodeAt(i));
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        var c, hi, lo;
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        for (var i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isnan(val) {
        return val !== val;
      }
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
  }, {
    "base64-js": 1,
    ieee754: 4,
    isarray: 3
  } ],
  3: [ function(require, module, exports) {
    var toString = {}.toString;
    module.exports = Array.isArray || function(arr) {
      return "[object Array]" == toString.call(arr);
    };
  }, {} ],
  4: [ function(require, module, exports) {
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = 8 * nBytes - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (;nBits > 0; e = 256 * e + buffer[offset + i], i += d, nBits -= 8) ;
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (;nBits > 0; m = 256 * m + buffer[offset + i], i += d, nBits -= 8) ;
      if (0 === e) e = 1 - eBias; else {
        if (e === eMax) return m ? NaN : Infinity * (s ? -1 : 1);
        m += Math.pow(2, mLen);
        e -= eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = 8 * nBytes - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = 23 === mLen ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || 0 === value && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || Infinity === value) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        value += e + eBias >= 1 ? rt / c : rt * Math.pow(2, 1 - eBias);
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e += eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (;mLen >= 8; buffer[offset + i] = 255 & m, i += d, m /= 256, mLen -= 8) ;
      e = e << mLen | m;
      eLen += mLen;
      for (;eLen > 0; buffer[offset + i] = 255 & e, i += d, e /= 256, eLen -= 8) ;
      buffer[offset + i - d] |= 128 * s;
    };
  }, {} ],
  GameUser: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3eba7BXVMNC4ov6MxWpUdcQ", "GameUser");
    "use strict";
    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          "value" in descriptor && (descriptor.writable = true);
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        protoProps && defineProperties(Constructor.prototype, protoProps);
        staticProps && defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    var TAG = "GameUser.js";
    var Client = require("../util/net_client");
    var request = require("../util/http_request");
    var constant = require("../share/constant");
    var errcode = require("../share/errcode");
    var GameUser = function() {
      function GameUser(id, coins) {
        _classCallCheck(this, GameUser);
        this.userId = id;
        this.coins = coins;
        this.account = "";
        this.nickname = "";
        this.sex = 0;
        this.iconUrl = "";
        this.connectData = null;
        this.address = "";
        var addressData = cc.sys.localStorage.getItem(constant.LOCAL_ITEM.address_data);
        if (addressData) {
          addressData = JSON.parse(addressData);
          this.address = addressData.address;
        }
        var connectData = cc.sys.localStorage.getItem(constant.LOCAL_ITEM.connect_data);
        if (connectData) {
          connectData = JSON.parse(connectData);
          this.connectData = connectData;
        }
      }
      _createClass(GameUser, [ {
        key: "buyCoins",
        value: function buyCoins(num) {
          if ("" == this.address) return next(errcode.REQUEST_URL_NULL);
          request.get({
            url: "",
            userId: this.userId
          }, function(code, ret) {
            if (code != errcode.OK) return next(code);
            if (ret.code != errcode.OK) return next(ret.code);
          });
        }
      }, {
        key: "logout",
        value: function logout(next) {
          if ("" == this.address) return next(errcode.REQUEST_URL_NULL);
          request.get({
            url: this.address + "/logout",
            userId: this.userId
          }, function(code, ret) {
            if (code != errcode.OK) return next(code);
            if (ret.code != errcode.OK) return next(ret.code);
            delete cc.g_ada.gameUser;
            next(0);
          });
        }
      }, {
        key: "createRoom",
        value: function createRoom(next) {
          var self = this;
          if ("" == this.address) return next(errcode.REQUEST_URL_NULL);
          var roomInfo = {
            userId: this.userId
          };
          roomInfo = JSON.stringify(roomInfo);
          request.get({
            url: this.address + "/createRoom",
            userId: this.userId,
            roomInfo: encodeURIComponent(roomInfo)
          }, function(code, ret) {
            console.log(TAG, "createRoom: ", code, JSON.stringify(ret));
            if (code != errcode.OK) return next(code);
            if (ret.code != errcode.OK) return next(ret.code);
            cc.sys.localStorage.setItem(constant.LOCAL_ITEM.connect_data, JSON.stringify(ret));
            doJoinRoom(ret, next);
          });
        }
      }, {
        key: "joinRoom",
        value: function joinRoom(roomId, next) {
          if ("" == this.address) return next(errcode.REQUEST_URL_NULL);
          request.get({
            url: this.address + "/joinRoom",
            userId: this.userId,
            roomId: roomId
          }, function(code, ret) {
            console.log(TAG, "joinRoom: ", code, JSON.stringify(ret));
            if (code != errcode.OK) return next(code);
            if (ret.code != errcode.OK) return next(ret.code);
            ret.roomId = roomId;
            cc.sys.localStorage.setItem(constant.LOCAL_ITEM.connect_data, JSON.stringify(ret));
            doJoinRoom(ret, next);
          });
        }
      }, {
        key: "reconnect",
        value: function reconnect(next) {
          if (!this.connectData) return next(errcode.CONNECTION_DATA_NULL);
          doJoinRoom(this.connectData, next);
        }
      } ]);
      return GameUser;
    }();
    var doJoinRoom = function doJoinRoom(ret, next) {
      var cli = new Client({
        ip: ret.ip,
        port: ret.port
      });
      cc.g_ada.cliSocket = cli;
      cli.connect(function(code) {
        if (code != errcode.OK) return console.log(TAG, "doJoinRoom: ", code);
        cli.request({
          route: "joinRoom",
          joinData: {
            roomId: ret.roomId,
            connectionCode: ret.connectionCode
          }
        }, function(result) {
          if (result.code != errcode.OK) return next(result.code);
          next(0);
        });
      });
    };
    module.exports = GameUser;
    cc._RF.pop();
  }, {
    "../share/constant": "constant",
    "../share/errcode": "errcode",
    "../util/http_request": "http_request",
    "../util/net_client": "net_client"
  } ],
  HomeScene: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "94fa7AOfX5N5ZJNJy74SRww", "HomeScene");
    "use strict";
    var TAG = "HomeScene.js";
    cc.Class({
      extends: cc.Component,
      properties: {
        idLabel: cc.Label,
        coinLabel: cc.Label,
        logoutButton: cc.Button,
        creatRoomButton: cc.Button,
        joinRoomButton: cc.Button,
        setupButton: cc.Button,
        msgButton: cc.Button,
        serviceButton: cc.Button,
        shopButton: cc.Button,
        noticeButton: cc.Button
      },
      onLoad: function onLoad() {
        console.log(TAG, "onLoad onLoad!!!!", JSON.stringify(cc.g_ada));
        this.logoutButton.node.on("click", this.onLogout, this);
        this.creatRoomButton.node.on("click", this.onCreateRoom, this);
        this.joinRoomButton.node.on("click", this.onJoinRoom, this);
        this.setupButton.node.on("click", this.onSetup, this);
        this.msgButton.node.on("click", this.onMsg, this);
        this.serviceButton.node.on("click", this.onService, this);
        this.shopButton.node.on("click", this.onShop, this);
        this.noticeButton.node.on("click", this.onNotice, this);
        this.idLabel.string = cc.g_ada.gameUser.userId;
        this.coinLabel.string = cc.g_ada.gameUser.coins;
      },
      onLogout: function onLogout() {
        console.log(TAG, "onLogout onLogout!!!");
        cc.g_ada.gameUser.logout(function(code) {
          if (0 != code) return console.log(TAG, code);
          cc.director.loadScene("LoginScene");
        });
      },
      onCreateRoom: function onCreateRoom() {
        console.log(TAG, "onCreateRoom onCreateRoom!!!");
        cc.g_ada.gameUser.createRoom(function(code) {
          if (0 != code) return console.log(TAG, code);
        });
      },
      onJoinRoom: function onJoinRoom() {
        console.log(TAG, "onJoinRoom onJoinRoom!!!");
        cc.g_ada.gameUser.joinRoom(roomId, function(code) {
          if (0 != code) return console.log(TAG, code);
        });
      },
      onSetup: function onSetup() {
        console.log(TAG, "onSetup onSetup!!!");
      },
      onMsg: function onMsg() {
        console.log(TAG, "onMsg onMsg!!!");
      },
      onService: function onService() {
        console.log(TAG, "onService onService!!!");
      },
      onShop: function onShop() {
        console.log(TAG, "onShop onShop!!!");
      },
      onNotice: function onNotice() {
        console.log(TAG, "onNotice onNotice!!!");
      }
    });
    cc._RF.pop();
  }, {} ],
  HotUpdateScene: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0cd04C8/iFGXIdJoNujmx2B", "HotUpdateScene");
    "use strict";
    var TAG = "HotUpdateScene.js";
    var HotUpdate = require("../util/hot_update");
    var errcode = require("../share/errcode");
    cc.Class({
      extends: cc.Component,
      properties: {
        local_manifest: {
          type: cc.Asset,
          default: null
        },
        st_label: cc.Label,
        ver_label: cc.Label,
        pct_label: cc.Label,
        file_lable: cc.Label
      },
      onLoad: function onLoad() {
        !cc.sys.isNative && cc.sys.isMobile;
        var self = this;
        console.log(TAG, "HotUpdateScene onloaded!!!!!!", this.local_manifest);
        this.hotUpdate = new HotUpdate(this.local_manifest);
      },
      start: function start() {
        var self = this;
        var localVersion = this.hotUpdate.getLocalVersion();
        self.ver_label.string = "V" + localVersion;
        cc.g_ada.localVersion = localVersion;
        console.log(TAG, "local version: ", localVersion);
        this.hotUpdate.check(function(code, data) {
          if (code != errcode.OK) {
            if (code != errcode.UPDATEING_ASSETS) return self.st_label.string = code;
            self.pct_label.string = data.percent;
            self.file_lable.string = data.fileTotal;
          } else cc.director.loadScene("LoginScene");
        });
      }
    });
    cc._RF.pop();
  }, {
    "../share/errcode": "errcode",
    "../util/hot_update": "hot_update"
  } ],
  LoginLauncher: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "551e2uBKMpPj6jDsnh+j+UC", "LoginLauncher");
    "use strict";
    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          "value" in descriptor && (descriptor.writable = true);
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        protoProps && defineProperties(Constructor.prototype, protoProps);
        staticProps && defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
    }
    var TAG = "LoginLauncher.js";
    var request = require("../util/http_request");
    var constant = require("../share/constant");
    var errcode = require("../share/errcode");
    var GameUser = require("./GameUser");
    var LoginLauncher = function() {
      function LoginLauncher() {
        _classCallCheck(this, LoginLauncher);
        this.account = "";
        this.cliType = constant.CLI_TYPE.app;
        this.accountType = constant.ACCOUNT_TYPE.tel;
        this.address = "";
        this.recommendation = "";
        var addressData = cc.sys.localStorage.getItem(constant.LOCAL_ITEM.address_data);
        if (addressData) {
          addressData = JSON.parse(addressData);
          this.address = addressData.address;
          this.recommendation = addressData.recommendation;
        }
      }
      _createClass(LoginLauncher, [ {
        key: "setAccount",
        value: function setAccount(account) {
          this.account = account;
        }
      }, {
        key: "getAccount",
        value: function getAccount() {
          return this.account;
        }
      }, {
        key: "setAccountType",
        value: function setAccountType(accountType) {
          this.accountType = accountType;
        }
      }, {
        key: "requestGate",
        value: function requestGate(next) {
          var self = this;
          var accountData = {};
          if (this.accountType == constant.ACCOUNT_TYPE.wx) {
            accountData.code = "";
            accountData.clientId = constant.CLIENT_ID;
          } else if (this.accountType == constant.ACCOUNT_TYPE.tel) accountData.account = this.account; else if (this.accountType == constant.ACCOUNT_TYPE.wb) ; else {
            if (this.accountType != constant.ACCOUNT_TYPE.mail) return next(errcode.UNKNOW_ACCOUNT_TYPE);
            accountData.account = this.account;
          }
          accountData = JSON.stringify(accountData);
          request.get({
            url: constant.GATE_URL,
            accountType: this.accountType,
            accountData: encodeURIComponent(accountData)
          }, function(code, ret) {
            console.log(TAG, "requestGate: ", code, JSON.stringify(ret));
            if (code != errcode.OK) return next(code);
            if (ret.code != errcode.OK) return next(ret.code);
            self.recommendation = ret.recommendation;
            self.address = "http://" + ret.ip + ":" + ret.port;
            cc.sys.localStorage.setItem(constant.LOCAL_ITEM.address_data, JSON.stringify({
              recommendation: self.recommendation,
              address: self.address
            }));
            self.account = ret.account;
            self.requestLogin(next);
          });
        }
      }, {
        key: "requestLogin",
        value: function requestLogin(next) {
          var self = this;
          var accountData = {
            nickName: "",
            gender: 0,
            avatarUrl: ""
          };
          accountData = JSON.stringify(accountData);
          request.get({
            url: this.address + "/login",
            account: this.account,
            cliType: this.cliType,
            accountType: this.accountType,
            clientId: constant.CLIENT_ID,
            recommendation: this.recommendation,
            accountData: encodeURIComponent(accountData)
          }, function(code, ret) {
            console.log(TAG, "requestLogin: ", code, JSON.stringify(ret));
            if (code != errcode.OK) return next(code);
            if (ret.code != errcode.OK) {
              if (ret.code == errcode.RECOMMENDATION_NOT_EXIST) {
                self.recommendation = "";
                self.address = "";
                return self.requestGate(next);
              }
              return next(ret.code);
            }
            cc.g_ada.gameUser = new GameUser(ret.userId, ret.coins);
            next(0);
          });
        }
      }, {
        key: "login",
        value: function login(next) {
          if ("" == this.account) return next(errcode.LOGIN_ACCOUNT_NULL);
          this.recommendation && this.address ? this.requestLogin(next) : this.requestGate(next);
        }
      }, {
        key: "requestRegister",
        value: function requestRegister(next) {}
      } ]);
      return LoginLauncher;
    }();
    module.exports = LoginLauncher;
    cc._RF.pop();
  }, {
    "../share/constant": "constant",
    "../share/errcode": "errcode",
    "../util/http_request": "http_request",
    "./GameUser": "GameUser"
  } ],
  LoginScene: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d485beTg3NDXr2FvvKyJCxV", "LoginScene");
    "use strict";
    var TAG = "LoginScene.js";
    var g_ada = cc.g_ada;
    var Login = require("../model/LoginLauncher");
    cc.Class({
      extends: cc.Component,
      properties: {
        verLablel: cc.Label,
        loginButton: cc.Button,
        accountEdBox: cc.EditBox
      },
      onLoad: function onLoad() {
        console.log(TAG, "onLoad onLoad ", cc.g_ada, g_ada);
        this.loginButton.node.on("click", this.onLogin, this);
        this.accountEdBox.node.on("editing-did-began", this.onEditDidBegan, this);
        this.accountEdBox.node.on("editing-did-ended", this.onEditDidEnd, this);
        this.accountEdBox.node.on("text-changed", this.onTextChange, this);
        this.accountEdBox.node.on("editing-return", this.onEditReturn, this);
        this.loginLauncher = new Login();
        if (cc.g_ada) {
          this.verLablel.string = "V" + cc.g_ada.localVersion || 0;
          cc.g_ada.loginLauncher = this.loginLauncher;
        }
      },
      onLogin: function onLogin() {
        console.log(TAG, "onLogin onLogin!!!");
        this.loginLauncher.login(function(code) {
          0 == code && cc.director.loadScene("HomeScene");
        });
      },
      onEditDidBegan: function onEditDidBegan() {
        console.log(TAG, "onEditDidBegan");
      },
      onEditDidEnd: function onEditDidEnd() {
        console.log(TAG, "onEditDidEnd", this.accountEdBox.string);
        this.loginLauncher.setAccount(this.accountEdBox.string);
      },
      onTextChange: function onTextChange() {
        console.log(TAG, "onTextChange");
      },
      onEditReturn: function onEditReturn() {
        console.log(TAG, "onEditReturn");
      }
    });
    cc._RF.pop();
  }, {
    "../model/LoginLauncher": "LoginLauncher"
  } ],
  LogoScene: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "38ccb4SfMJBXoq4SkxgoXn+", "LogoScene");
    "use strict";
    var TAG = "LogoScene.js";
    var g_ada = {};
    cc.g_ada = g_ada;
    var cls = {};
    cls.extends = cc.Component;
    cls.properties = {};
    cls.onLoad = function() {
      console.log(TAG, "onLoad");
      this.init();
      setTimeout(function() {
        console.debug(TAG, "111111   ", cc.director.loadScene("HotUpdateScene"), cc.director.getScene());
      }, 2e3);
    };
    cls.init = function() {};
    var urlParse = function urlParse() {
      console.log(TAG, window.io);
      var params = {};
      if (null == window.location) return params;
      var name, value;
      var str = window.location.href;
      var num = str.indexOf("?");
      str = str.substr(num + 1);
      var arr = str.split("&");
      for (var i = 0; i < arr.length; i++) {
        num = arr[i].indexOf("=");
        if (num > 0) {
          name = arr[i].substring(0, num);
          value = arr[i].substr(num + 1);
          params[name] = value;
        }
      }
      return params;
    };
    cc.Class(cls);
    cc._RF.pop();
  }, {} ],
  NiuScene: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "65b0eTyUwtCcYoZXIJZa/V6", "NiuScene");
    "use strict";
    var TAG = "NiuScene.js";
    cc.Class({
      extends: cc.Component,
      properties: {
        empty: cc.Node,
        seat: cc.Node
      },
      onLoad: function onLoad() {
        console.warn(TAG, "onLoad");
      },
      start: function start() {
        console.warn(TAG, "start");
      },
      update: function update(dt) {},
      onSeatDownBtn: function onSeatDownBtn() {
        console.log(TAG, "seatdown clicked");
      },
      onReadyBtn: function onReadyBtn() {},
      onRobBankerBtn: function onRobBankerBtn() {},
      onCallMultipleBtn: function onCallMultipleBtn() {},
      onTransposeBtn: function onTransposeBtn() {},
      onExitRoomBtn: function onExitRoomBtn() {}
    });
    cc._RF.pop();
  }, {} ],
  Player: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8da86ndPZlO5ahB1y1xNsN1", "Player");
    "use strict";
    var TAG = "Player.js";
    cc._RF.pop();
  }, {} ],
  Room: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "53e46+9M89ITLSSlwlmVxYl", "Room");
    "use strict";
    var TAG = "Room.js";
    cc._RF.pop();
  }, {} ],
  constant: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "06b5fV5AdNBcrWBI7oMdOwX", "constant");
    "use strict";
    module.exports = {
      CLIENT_ID: 101,
      GATE_URL: "http://192.168.10.34:8090/validateUser",
      CLI_TYPE: {
        app: "app",
        mini: "mini_program",
        pc: "pc",
        web: "web"
      },
      ACCOUNT_TYPE: {
        wx: "wechat",
        tel: "telnumber",
        wb: "weibo",
        mail: "mail"
      },
      LOCAL_ITEM: {
        address_data: "AddressData",
        connect_data: "ConnectData"
      }
    };
    cc._RF.pop();
  }, {} ],
  errcode: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a2671mrtJZLL4P6+5qnrofv", "errcode");
    "use strict";
    module.exports = {
      OK: 0,
      FAIL: 1,
      TIMEOUT: 2,
      HAVE_FROZEN: 3,
      ACCOUNT_TYPE_ERR: 4,
      RECOMMENDATION_NOT_EXIST: 5,
      ROUTE_ERR: 6,
      REGISTER_FAIL: 9,
      UP_GEN_USREID_LIMIT: 10,
      LOGIN_ERR: 11,
      LOGINED: 12,
      LOGIN_INVALID: 13,
      LOGIN_USERID_NULL: 14,
      REDIS_DATABASE_ERR: 20,
      MYSQL_DATABASE_ERR: 21,
      CHECK_UPDATE_ERR: 1e4,
      HOT_UPDATE_ERR: 10001,
      DECOMPRESS_ERR: 10002,
      ASSET_UPDATE_ERR: 10003,
      LOCAL_MANIFEST_LOAD_ERR: 10004,
      ASSET_MANAGER_UNINITED: 10005,
      UPDATEING_ASSETS: 10006,
      UPDATE_FINISHED: 10007,
      UNKNOW_ACCOUNT_TYPE: 10010,
      LOGIN_ACCOUNT_NULL: 10011,
      REQUEST_URL_NULL: 10012,
      HTTP_REQUEST_TIMEOUT: 10050,
      HTTP_REQUEST_ERROR: 10051,
      SOCKET_CLOSE: 10055,
      CONNECTION_DATA_NULL: 10100,
      CODE_MSG: {
        10000: "\u68c0\u67e5\u66f4\u65b0\u9519\u8bef\uff01"
      }
    };
    cc._RF.pop();
  }, {} ],
  hot_update: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cf371mN82VFdroJG1nqqOtk", "hot_update");
    "use strict";
    var TAG = "hot_update.js";
    var errcode = require("../share/errcode");
    var hot = {};
    var compareFunc = function compareFunc(v1, v2) {
      var arr1 = v1.split(".");
      var arr2 = v2.split(".");
      for (var i = 0; i < arr1.length; ++i) {
        var a = parseInt(arr1[i]);
        var b = parseInt(arr2[i] || 0);
        if (a === b) continue;
        return a - b;
      }
    };
    hot.ctor = function() {
      var localManifest = arguments[0].nativeUrl;
      this.localManifest = localManifest;
      var localPath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "new-assets";
      console.log(TAG, localManifest, localPath, cc.sys.isNative);
      this.am = new jsb.AssetsManager(localManifest, localPath, compareFunc);
      this.am.setVerifyCallback(function(filepath, asset) {
        console.log(TAG, "setVerifyCallback  ", filepath);
        return true;
        var md5;
      });
      this.am.loadLocalManifest(localManifest);
    };
    var calculateFileMD5 = function calculateFileMD5(filepath) {};
    hot.check = function(next) {
      var self = this;
      var state = this.am.getState();
      state == jsb.AssetsManager.State.UNINITED && this.am.loadLocalManifest(this.localManifest);
      var lmf = this.am.getLocalManifest();
      if (!lmf || !lmf.isLoaded()) return next(errcode.LOCAL_MANIFEST_LOAD_ERR);
      this.am.setEventCallback(function(event) {
        var cval = event.getEventCode();
        cc.log(TAG, "3333333 hot.check ", cval);
        switch (cval) {
         case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
          cc.log(TAG + " No local manifest file found");
          self.am.setEventCallback(null);
          next(errcode.CHECK_UPDATE_ERR);
          break;

         case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
         case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
          cc.log(TAG + " Fail to download manifest file");
          self.am.setEventCallback(null);
          next(errcode.CHECK_UPDATE_ERR);
          break;

         case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
          console.log(TAG, "alrady");
          self.am.setEventCallback(null);
          next(errcode.OK);
          break;

         case jsb.EventAssetsManager.NEW_VERSION_FOUND:
          cc.log(TAG + " New version found, updating...");
          self.am.setEventCallback(null);
          self.update(next);
          break;

         case jsb.EventAssetsManager.UPDATE_PROGRESSION:
          cc.log(TAG, "\u4e0b\u8f7dversion.manifest \u6587\u4ef6\uff01\uff01\uff01");
          break;

         default:
          return;
        }
      });
      this.am.checkUpdate();
    };
    hot.update = function(next) {
      var self = this;
      var state = this.am.getState();
      state == jsb.AssetsManager.State.UNINITED && this.am.loadLocalManifest(this.localManifest);
      this.am.setEventCallback(function(event) {
        var cval = event.getEventCode();
        cc.log(TAG, "44444444 hot.update  ", cval);
        switch (cval) {
         case jsb.EventAssetsManager.UPDATE_PROGRESSION:
          var percent = event.getPercent();
          var filePercent = event.getPercentByFile();
          var fileTotal = event.getDownloadedFiles() + " / " + event.getTotalFiles();
          var byteTotal = event.getDownloadedBytes() + " / " + event.getTotalBytes();
          cc.log(TAG, "jsb.EventAssetsManager.UPDATE_PROGRESSION");
          var data = {
            percent: percent,
            filePercent: filePercent,
            fileTotal: fileTotal,
            byteTotal: byteTotal
          };
          next(errcode.UPDATEING_ASSETS, data);
          break;

         case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
         case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
          cc.log(TAG + " Fail to download manifest file");
          self.am.setEventCallback(null);
          next(errcode.HOT_UPDATE_ERR);
          break;

         case jsb.EventAssetsManager.ERROR_UPDATING:
          cc.log(TAG, "jsb.EventAssetsManager.ERROR_UPDATING: ", event.getAssetId(), event.getMessage());
          next(errcode.ASSET_UPDATE_ERR);
          break;

         case jsb.EventAssetsManager.ERROR_DECOMPRESS:
          cc.log(TAG, "jsb.EventAssetsManager.ERROR_DECOMPRESS:", event.getMessage());
          next(errcode.DECOMPRESS_ERR);
          break;

         case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
          self.am.setEventCallback(null);
          next(errcode.OK);
          break;

         case jsb.EventAssetsManager.UPDATE_FINISHED:
          self.am.setEventCallback(null);
          self.gameRestart();
          next(errcode.UPDATEING_FINISHED);
          break;

         case jsb.EventAssetsManager.UPDATE_FAILED:
          cc.log(TAG, "jsb.EventAssetsManager.UPDATE_FAILED: ", event.getMessage());
          self.am.downloadFailedAssets();
          next(errcode.HOT_UPDATE_ERR);
        }
      });
      this.am.update();
    };
    hot.gameRestart = function() {
      var searchPathArr = jsb.fileUtils.getSearchPaths();
      var newPathArr = this.am.getLocalManifest().getSearchPaths();
      console.log(TAG, "@@@@@  ", JSON.stringify(searchPathArr), JSON.stringify(newPathArr));
      Array.prototype.unshift.apply(searchPathArr, newPathArr);
      cc.sys.localStorage.setItem("HotUpdateSearchPaths", JSON.stringify(searchPathArr));
      jsb.fileUtils.setSearchPaths(searchPathArr);
      cc.audioEngine.stopAll();
      cc.game.restart();
    };
    hot.getLocalVersion = function() {
      var manifest = this.am.getLocalManifest();
      return manifest.getVersion();
    };
    module.exports = cc.Class(hot);
    cc._RF.pop();
  }, {
    "../share/errcode": "errcode"
  } ],
  http_request: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c6a79XCenlAGbtMjDjrqazC", "http_request");
    "use strict";
    var TAG = "http_request.js";
    var errcode = require("../share/errcode");
    var request = {};
    request.get = function(opt, next) {
      var url = opt.url;
      delete opt["url"];
      url += "?";
      for (var key in opt) {
        var val = opt[key];
        url += key + "=" + val + "&";
      }
      console.log(TAG, "http get \u8bf7\u6c42\uff1a ", url);
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        4 == xhr.readyState && xhr.status >= 200 && xhr.status < 400 && (next ? next(0, JSON.parse(xhr.responseText)) : null);
      };
      xhr.open("GET", url, true);
      xhr.send();
      xhr.ontimeout = function() {
        console.log(TAG, "@@@@@@ ontimeout");
        next ? next(errcode.HTTP_REQUEST_TIMEOUT) : null;
      };
      xhr.onerror = function() {
        console.log(TAG, "###### xhr error");
        next ? next(errcode.HTTP_REQUEST_ERROR) : null;
      };
    };
    request.post = function(opt, next) {
      var url = opt.url;
      delete opt["url"];
      var param = "";
      for (var key in opt) param += key + "=" + opt[key] + "&";
      console.log(TAG, "http post \u8bf7\u6c42\uff1a ", url);
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        4 == xhr.readyState && xhr.status >= 200 && xhr.status < 400 && (next ? next(0, JSON.parse(xhr.responseText)) : null);
      };
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send(param);
      xhr.ontimeout = function() {
        console.log(TAG, "@@@@@@ ontimeout");
        next ? next(errcode.HTTP_REQUEST_TIMEOUT) : null;
      };
      xhr.onerror = function() {
        console.log(TAG, "###### xhr error");
        next ? next(errcode.HTTP_REQUEST_ERROR) : null;
      };
    };
    module.exports = request;
    cc._RF.pop();
  }, {
    "../share/errcode": "errcode"
  } ],
  net_client: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "72d2dm2wMhLjavwIpHwY+Kw", "net_client");
    "use strict";
    var TAG = "net_client.js";
    var packet = require("./packet");
    var Buffer = require("buffer").Buffer;
    var errcode = require("../share/errcode");
    var cls = {};
    var bufferAnalysis = function bufferAnalysis(self, buffer) {
      self.remainderData = Buffer.concat([ self.remainderData, buffer ]);
      var len = self.remainderData.length;
      console.log(TAG, "data data: bufflen:", buffer.length, "remainderLen :", len);
      var bodylen = 0;
      var packlen = 0;
      var idx = 0;
      while (true) {
        if (len - idx < 4) {
          self.remainderData = self.remainderData.slice(idx, len);
          break;
        }
        bodylen = self.remainderData.readUInt32BE(idx);
        packlen = bodylen + 4;
        if (idx + packlen > len) {
          self.remainderData = self.remainderData.slice(idx, len);
          break;
        }
        idx += packlen;
        var jsonData = packet.unpack(self.remainderData, idx - bodylen, idx);
        self.node.emit("socketData", jsonData);
        if (idx == len) {
          self.remainderData = Buffer.alloc(0);
          break;
        }
      }
    };
    var doConnect = function doConnect(self, url, next) {
      var socket = new WebSocket(url);
      socket.onopen = function() {
        self.socket = socket;
        next ? next(0) : null;
        setTimeout(function() {
          self.ping();
          self.freqTimeId = setInterval(function() {
            self.ping();
          }, 1e3 * self.HBInterval);
        }, 1e3);
      };
      socket.onmessage = function(event) {
        bufferAnalysis(self, new Buffer(event.data));
      };
      socket.onclose = function() {
        console.log("3333333333  onclose \u51c6\u5907\u91cd\u65b0\u8fde\u63a5\uff01\uff01\uff01 ");
        self.close();
        next ? next(errcode.SOCKET_CLOSE) : null;
      };
      socket.onerror = function(event) {
        console.log("4444444444  onerror ", event);
        for (var k in event) console.log(k, event[k]);
        throw event;
      };
    };
    cls.ctor = function() {
      this.socket = null;
      this.addr = arguments[0];
      this.HBInterval = 20;
      this.HBTime = 0;
      this.freqTimeId = null;
      this.closeTimeId = null;
      this.remainderData = Buffer.alloc(0);
      this.reconnectTimes = 3;
      this.node = new cc.Node();
    };
    cls.connect = function(next) {
      var self = this;
      var url = "ws://" + this.addr.ip + ":" + this.addr.port;
      console.log(TAG, "\u51c6\u5907\u8fde\u63a5\u670d\u52a1\u5668\uff1a", url, this.node);
      doConnect(self, url, next);
      self.node.on("socketData", function(data) {
        console.log(TAG, "Client socketData", JSON.stringify(data), self.HBTime);
        if ("pong" == data.route) {
          if (data.time == self.HBTime && self.closeTimeId) {
            clearTimeout(self.closeTimeId);
            self.closeTimeId = null;
          }
        } else self.node.emit(data.route, data);
      });
    };
    cls.send = function(data) {
      var pack = packet.pack(data);
      this.socket.send(pack);
    };
    cls.ping = function() {
      var self = this;
      this.HBTime = Date.now();
      this.send({
        route: "ping",
        time: this.HBTime
      });
      this.closeTimeId = setTimeout(function() {
        self.closeTimeId = null;
        self.close();
      }, 1e3 * this.HBInterval / 2);
    };
    cls.request = function(data, next) {
      this.send(data);
      this.node.once(data.route, function(ret) {
        next(ret);
      });
    };
    cls.on = function(event, next) {
      this.node.on(event, next);
    };
    cls.close = function() {
      this.socket.close();
      if (this.freqTimeId) {
        clearInterval(this.freqTimeId);
        this.freqTimeId = null;
      }
      if (this.closeTimeId) {
        clearTimeout(this.closeTimeId);
        this.closeTimeId = null;
      }
      this.remainderData = Buffer.alloc(0);
    };
    module.exports = cc.Class(cls);
    cc._RF.pop();
  }, {
    "../share/errcode": "errcode",
    "./packet": "packet",
    buffer: 2
  } ],
  packet: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "95390LhufNJL5MzTv+Mby1+", "packet");
    "use strict";
    var TAG = "utils/packet.js";
    var Buffer = require("buffer").Buffer;
    var p = module.exports;
    p.pack = function(jsonData) {
      var str = JSON.stringify(jsonData);
      var pack = Buffer.alloc(4 + str.length);
      pack.writeUInt32BE(str.length);
      pack.write(str, 4);
      return pack;
    };
    p.unpack = function(buf, start, end) {
      var str = buf.toString("utf8", start, end);
      return JSON.parse(str);
    };
    cc._RF.pop();
  }, {
    buffer: 2
  } ],
  util: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5f9e3h3wT1OUozUsgqZlcAq", "util");
    "use strict";
    var TAG = "util.js";
    var exp = module.exports;
    exp.md5 = function(str) {};
    exp.clone = function(pbj) {};
    exp.setLocalStore = function(name, str) {};
    exp.getLocalStore = function(name) {};
    cc._RF.pop();
  }, {} ]
}, {}, [ "GameUser", "LoginLauncher", "Player", "Room", "HomeScene", "HotUpdateScene", "LoginScene", "LogoScene", "NiuScene", "constant", "errcode", "hot_update", "http_request", "net_client", "packet", "util" ]);