const fs = require("fs");
const util = require("util");
const Path = require("path");
/**
 * 
 * @param {*} modulename 
 * @param {*} opts 
 * {
 *  
 * }
 */
// 默认不缓存数据
const _opts = {
    cache: false,
    store: {

    }
};
var Require = function(modulename, opts) {
    let me = this;
    if (typeof opts !== "Object") {
        // 是布尔值
        opts = {
            cache: !!opts
        };
    }
    opts = Object.assign({}, _opts, opts || {});
    let modulePathObject = me.getModulePath(modulename);
    let modulePath = modulePathObject.modulePath;
    let shoudDeleteCache = me.analyseOpts(opts, modulePathObject);
    if (shoudDeleteCache) delete require.cache[modulePath];
    require(modulePath);
};
Require.prototype.analyseOpts = function(opts, modulePathObject) {
    let me = this;
    let shoudDeleteCache = true;
    if (opts && !opts.cache && !modulePathObject.isModule) {
        // 
        try {
            let stat = fs.statSync(modulePathObject.modulePath);
            let fileState = util.inspect(stat);
            if (opts.store.hasOwnProperty(modulePathObject.modulePath)) {
                if (opts.store[modulePathObject.modulePath].mtime != fileState.mtime) {
                    shoudDeleteCache = true;
                }
            }
            delete opts.store[modulePathObject.modulePath];
            opts.store[modulePathObject.modulePath] = fileState;
        } catch (e) {
            shoudDeleteCache = true;
        }
    } else {
        shoudDeleteCache = false;
    }
    return shoudDeleteCache;
};
Require.prototype.getModulePath = function(modulename) {
    let me = this;
    if (me.isModule(modulename)) {
        return {
            isModule: true,
            modulePath: modulename
        };
    } else {
        // 返回相对于调用者的绝对路径
        return {
            isModule: false,
            modulePath: path.join(module.parent.filename, modulename)
        }
    }
    return null;
};
Require.prototype.isModule = function(modulename) {
    // 判断他是不是模块主要判断他的开头的字幕是不是相对的路径
    let reg = /^[^\.\/\\]/gi;
    return !!(modulename && (typeof modulename == "string") ? modulename.match(reg) : null);
};

module.exports = Require;