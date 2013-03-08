exports.load = function () {

	String.prototype.ucfirst = function () {
		var f = this.charAt(0).toUpperCase();
		return f + this.substr(1);
	};
	
	String.prototype.trim = function () {
		return this.replace(/^\s+/g,'').replace(/\s+$/g,'')
	};

	String.prototype.isEmpty = function () {
		if (typeof this == 'undefined' || this === null || this === '') return true;
		if (typeof this == 'number' && isNaN(this)) return true;
		if (this instanceof Date && isNaN(Number(obj))) return true;
		if ( this == '' ) return true;
		if ( this.match(/^\s+$/) ) return true;
		return false;
	}
	
	fs.rmdirfSync = function (path, callback) {
		var files = [];
		if( fs.existsSync(path) ) {
			files = fs.readdirSync(path);
			files.forEach(function(file,index){
				var curPath = path + "/" + file;
				if(fs.statSync(curPath).isDirectory()) { // recurse
					rmdirfSync(curPath);
				} else { // delete file
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(path);
		}
	}
   
};