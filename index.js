var fs = require("fs");
var Path = require("path");
var util = require("up-util")
var Require = function(name,ifNotLocal){
	name = util.trim(name);
	if(Path.isAbsolute(name) || !ifNotLocal) {
		return require(name);
	} else {
		var path = process.cwd();
		var mod = findModules(path,name);
		if(!mod) {
			return require(name)
		} else {
			return mod;
		}
	}
};
Require.prototype.__proto__ = require;
function findModules(path,name) {
	if(hasMenus(path)) {
		var tmppath = Path.join(path,"./node_modules",name);
		try{
			var stat = require(tmppath);
			return stat;
		} catch(e) {
			// 当前路径下并没有想要的
		}
	}
	var pre = prePath(path);
	return pre ? findModules(pre) : null;
};
function hasMenus(path) {
	try {
		var state = fs.statSync(path);
		return state.isDirectory();
	} catch(e) {
		return false;
	};
	return false;
};
function prePath(path){
	var reg = /(\/([\d\w-_.])+)/gi;
	if(reg.test(path)) {
		return path.replace(ref,"");
	}
	// 已经到头了
	return null;
}
module.exports = Require;