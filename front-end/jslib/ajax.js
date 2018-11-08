function ajax_get(url, callback)
{
	var ajax = new XMLHttpRequest();
	ajax.open('get', url, true);
	ajax.send();

	ajax.onreadystatechange = function () {
   		if (ajax.readyState == 4 && ajax.status == 200) {

			//console.log("respone: ", ajax.readyState, ajax.status);
			var text = ajax.responseText;
			callback(text);
			//console.log(text);
		}
		else
		{
			console.log(ajax);
		}
	}
}
