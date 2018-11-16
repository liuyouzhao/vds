const dal = require('./dal_impl.js');
const sm_practise = require('./submission/practise.js');

var __schedules = [];
var __interval = null;

function __now() {
	var date = new Date();
	var hour = date.getHours();
	var minute = date.getMinutes();

	for(var i = 0; i < __schedules.length; i ++) {
		var s = __schedules[i];
		if(s.hour == hour && s.minute == minute && s.done == false) {
			s.fire(dal);
			s.done = true;
		}
		else if(s.hour == hour - 1) {
			if(hour == 0 && s.hour == 23 || hour - 1 == s.hour)
				s.done = false;
		}
	}
}

function regist_schedules(ss) {
	__schedules = ss;
}

function __practise_deviance_task(dal) {
	dal.deduct_practise_deviance(function(err, result) {
		if(err == null) {
			dal.set_min_practise_deviance(function(err, result) {
				if(err == null) {
					console.log("[TASK OK] __practise_deviance_task");
				}
				else {
					console.log("[TASK FALED] __practise_deviance_task");
				}
			});
		}
		else {
			console.log("[TASK FALED] __practise_deviance_task");
		}
	});
}

function init() {
	regist_schedules([
		{
			hour : 23,
			minute : 6,
			done : false,
			fire : __practise_deviance_task
		}
	]);

	__interval = setInterval(function() {
		__now();
	}, 30 * 1000);
}

function deinit() {
	clearInterval(__interval);
}


module.exports = {
	init,
	regist_schedules,
	deinit
};
