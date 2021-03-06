const express = require('express');
const url = require('url');
const api_impl = require('./core/api_impl.js');
const dal_impl = require('./core/dal_impl.js');
const timer_impl = require('./core/timer_impl.js');
const __step__ = require('./thirdparty/step.js');

var __mock_session = {
	user_name : "hujia"
};

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

			/* Init schedule */
			timer_impl.init();
			
		},

		function __i3(prvst) {
			if(prvst == false)
				throw err;
			/*[3] Start server */
			__start_server();	
		}		
	);
}

function __process_server(app, req, res) {
	try {
		var params = url.parse(req.url, true).query;
		__mock_session.context = app;
		__mock_session.res = res;
		__mock_session.finish = function(ret) {
			__mock_session.res.send(JSON.stringify(ret));
		}
		api_impl.process(__mock_session, params);
	}
	catch(ex) {
		console.log(ex);
	}
}

function __start_server() {
	const app = express();
	app.get('/api', function (req, res) {
		__process_server(app, req, res);
	});
	app.use(express.static('front-end'));
	app.listen(8088, () => console.log('voc_depot_sys listening on port 8088'));
}


function deinit() {
	dal_impl.deinit();
	api_impl.deinit();
}


init();