const express = require('express');
const url = require('url');
const api_impl = require('./core/api_impl.js');
const dal_impl = require('./core/dal_impl.js');
const __step__ = require('../thirdparty/step.js');

function init() {

	__step__(

		function __i1() {
			/*[1] Init database module */
			dal_impl.init(this);
		},

		function __i2(prvst) {
			if(prvst == false)
				throw err;
			/*[2] Init api module */
			api_impl.init(this);
		},

		function __i3(prvst) {
			if(prvst == false)
				throw err;
			/*[3] Start server */
			__start_server();	
		}		
	);

	
}

function __start_server() {
	const app = express();
	app.get('/api', function (req, res) {
		var params = url.parse(req.url, true).query;
		console.log("api request: ", params);
	 	res.send(api_impl.process(params));
	});
	app.use(express.static('front-end'));
	app.listen(8088, () => console.log('voc_depot_sys listening on port 8088'))
}


function deinit() {
	dal_impl.deinit();
	api_impl.deinit();
}