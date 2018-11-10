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

function __transact_machine(session, func, data) {

	var divert_method = null;
	var divert_data = null;

	switch(func) {
	case 'bind_user':
	break;
	case 'search':
		dal.search_words(
		{
			spell : data["spell"]
		}, function (err, result) {
			if(err) {
				__on_exception(session, err);
			}
			else {
				__on_ok(session, result);
			}
		});
	break;
	case 'query_word_info':
		dal.query_word_info(
		{
			spell : data["spell"]
		}, function (err, result) {
			if(err) {
				__on_exception(session, err);
			}
			else {
				__on_ok(session, result);
			}
		});
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
	case 'update_word':
		dal.start_transaction(
			[	
				dal.biz_update_word_attributes,
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
				}
		  	],
			function (step, err, result) {
				console.log("TANSACTION STEP - ", step, "[DONE]");
				return false;
			},
			function (err, finished) {
				if(finished) {
					__on_ok(session, "success");
				}
				else if(divert_method != null) {
					__transact_machine(session, divert_method, divert_data);
				}
				else if(err) {
					__on_exception(session, err);
				}
			}
		);
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
				dal.query_word_info,
				dal.biz_insert_new_word,
				dal.biz_insert_new_practise,
				dal.biz_update_word_days 
		  	],
			[
				{
					spell : data["spell"]
				},
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
			function (step, err, result) {
				/* Duplicated word */
				if(step == 0 && result.length > 0) {
					console.log("TANSACTION STEP - ", step, "[DONE] --> [DIVERSE]");
					divert_method = "update_word";
					divert_data = data;
					return true;
				}
				console.log("TANSACTION STEP - ", step, "[DONE]");
				return false;
			},
			function (err, finished) {

				if(finished) {
					__on_ok(session, "success");
				}
				else if(divert_method != null) {
					__transact_machine(session, divert_method, divert_data);
				}
				else if(err) {
					__on_exception(session, err);
				}
			});
	break;
	}
	
	return;
}


function process(session, params) {
	var ret = Object.create(params);
	ret["result"] = {};
	var func = params.func;
	var data = JSON.parse(params.data);
	__transact_machine(session, func, data);
}

function deinit() {
}

module.exports = {
	init,
	process,
	deinit
}