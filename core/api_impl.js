const dal = require('./dal_impl.js');
const __step__ = require('../thirdparty/step.js');

function init(callback) {
	callback(true);
}

function __on_exception(session, err) {
	var ret = {};
	ret["result"] = {};
	ret["result"]["exception"] = err;
	ret["result"]["status"] = "failed";
	session.finish(ret);
}

function __on_ok(session, message) {
	var ret = {};
	ret["result"] = {};
	ret["result"]["status"] = "success";
	ret["result"]["message"] = message;
	session.finish(ret);
}

function process(session, params) {
	var ret = Object.create(params);
	ret["result"] = {};
	var func = params.func;
	var data = JSON.parse(params.data);
	switch(func) {
		case 'bind_user':
		break;
		case 'getws_all':
		break;
		case 'getws_section':
		break;
		case 'getw_outter':
		break;
		case 'getw_inner':
		break;
		case 'practice_any':
		break;
		case 'practice_section':
		break;
		case 'practice_inform':
		break;
		case 'enroll_word':
			/*
			{
				"spell":"charisma",
				"function":"charis(基督) + ma(圣母玛利亚) --> 神赐的能力",
				"property":"n.",
				"example":"Every woman has her own unique brand of charisma."
			},
			*/
			dal.start_transaction(
				[
					dal.biz_insert_new_word,
					dal.biz_insert_new_practise,
					dal.biz_update_word_days
				],
				[
					{
						spell : data["spell"],
						function : data["function"],
						property : data["property"],
						example : data["example"]
					},
					{
						user_name : session.user_name,
						voc_spell : data["spell"],
						fami_reviewtimes : data["days"]
					},
					{
						user_name : session.user_name,
						voc_spell : data["spell"],
						fami_reviewtimes : data["days"]
					}
				],
				function (step) {
					console.log("TANSACTION STEP - ", step, "[DONE]");
				},
				function (err, finished) {
					if(finished) {
						__on_ok(session, "enroll word success!");
					}
					else {
						__on_exception(session, err);
					}
				});
		break;
	}
	
	return;
}

function deinit() {
}

module.exports = {
	init,
	process,
	deinit
}