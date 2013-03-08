exports.toString = function (date) {
	var dd = date.getDate();
	var mm = date.getMonth() + 1;
	var yyyy = date.getFullYear();
	if (dd<10)  dd='0'+dd
	if (mm<10) 	mm='0'+mm
	
	date = dd+'/'+mm+'/'+yyyy;
	
	return date;
}

exports.toDate = function (date) {
	var dd = date.getDate();
	var mm = date.getMonth() + 1;
	var yyyy = date.getFullYear();
	if (dd<10)  dd='0'+dd
	if (mm<10) 	mm='0'+mm
	
	date = dd+'/'+mm+'/'+yyyy;
	
	return date;
}

exports.toDate = function (date) {
	var dateString = date.split('/');
	date = new Date(dateString[2], dateString[1] - 1, dateString[0]);
	return date;
}
exports.isDate = function (date) {
	return date.getMonth;
}