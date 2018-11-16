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
		var final_result = {};
		dal.start_transaction(
				[
					dal.biz_query_word_info,
					dal.biz_query_section_by_word
				],
				[
					{
						spell : data["spell"]
					},
					{
						spell : data["spell"]
					}
				],
				function (step, err, result) {
					if(step == 0 && result.length == 0) {
						console.log("TANSACTION STEP - ", step, "[LOGICALLY_CEASE]");
						return dal.transact_stat_FINISH;
					}
					else if(step == 0) {
						final_result["word_info"] = result;
					}
					else if(step == 1) {
						final_result["section"] = result;
					}
					console.log("TANSACTION STEP - ", step, "[DONE]", result);
					return dal.transact_stat_CONTINUE;
				},
				function (err, finished) {
					if(finished) {
						__on_ok(session, final_result);
					}
					else if(err) {
						__on_exception(session, err);
					}
				}
			);

		// dal.query_word_info(
		// {
		// 	spell : data["spell"]
		// }, function (err, result) {
		// 	if(err) {
		// 		__on_exception(session, err);
		// 	}
		// 	else {
		// 		__on_ok(session, result);
		// 	}
		// });
	break;
	case 'getws_all':
	break;
	case 'getws_section':
	break;
	case 'getw_outter':
	break;
	case 'getw_inner':
	break;
	case 'get_all_sections':
		dal.query_all_sections(
			function (err, result) {
				if(err) {
					__on_exception(session, err);
				}
				else {
					__on_ok(session, result);
				}
			});
	break;
	case 'set_words_section':
		dal.start_transaction(
			[
				dal.biz_query_word_section,
				dal.biz_insert_word_section
			],
			[
				{
					section_id : data["section_id"],
					voc_spell : data["voc_spell"]
				},
				{
					section_id : data["section_id"],
					voc_spell : data["voc_spell"]
				}
			],
			function (step, err, result) {
				if(step == 0 && err) {
					console.log("TANSACTION STEP - ", step, "[INTERCEPTED]");
					__on_exception(session, err);
					return dal.transact_stat_CEASE;
				}
				else {
					if(result.length > 0) {
						console.log("TANSACTION STEP - ", step, "[LOGICALLY_CEASE]");
						__on_ok(session, "section duplicated");
					}
					else {
						console.log("TANSACTION STEP - ", step, "[DONE]");
					}
				}
				return dal.transact_stat_CONTINUE;
			},
			function (err, finished) {
				if(finished) {
					__on_ok(session, "success");
				}
				else if(err) {
					__on_exception(session, err);
				}
			});
	break;
	case 'practice_any':
	break;
	case 'practice_section':
		dal.query_word_by_section(
			{
				group_info : data["group_info"]
			},
			function (err, result) {
				if(err) {
					__on_exception(session, err);
				}
				else {
					__on_ok(session, result);
				}
			});
	break;
	case 'practice_inform':
	break;
	case 'update_word_groupinfo':
		dal.start_transaction(
			[
				dal.biz_update_word_groupinfo,
				dal.query_word_info
			],
			{
				spell : data["spell"]
			},
			function (step, err, result) {
				if(step == 0 && err) {
					console.log("TANSACTION STEP - ", step, "[INTERCEPTED]");
					__on_exception(session, err);
					return dal.transact_stat_CEASE;
				}
				console.log("TANSACTION STEP - ", step, "[DONE]");
				return dal.transact_stat_CONTINUE;
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
	case 'update_word':
		dal.start_transaction(
			[	
				dal.biz_update_word_attributes,
				dal.biz_update_word_days,
				dal.biz_query_word_section,
				dal.biz_insert_word_section
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
					section_id : data["section_id"],
					voc_spell : data["spell"]
				},
				{
					section_id : data["section_id"],
					voc_spell : data["spell"]
				}
		  	],
			function (step, err, result) {
				if(step == 2 && result.length > 0) {
					console.log("TANSACTION STEP - ", step, "[LOGICALLY_CEASE]");
					return dal.transact_stat_FINISH;
				}
				console.log("TANSACTION STEP - ", step, "[DONE]");
				return dal.transact_stat_CONTINUE;
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
		transact_stat_CONTINUE,
		transact_stat_CEASE,
		transact_stat_FINISH,
		*/
		dal.start_transaction(
			[	
				dal.query_word_info,
				dal.biz_insert_new_word,
				dal.biz_insert_new_practise,
				dal.biz_update_word_days,
				dal.biz_query_word_section,
				dal.biz_insert_word_section
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
				},
				{
					section_id : data["section_id"],
					voc_spell : data["spell"]
				},
				{
					section_id : data["section_id"],
					voc_spell : data["spell"]
				}
			],
			function (step, err, result) {
				/* Duplicated word */
				if(step == 0 && result.length > 0) {
					console.log("TANSACTION STEP - ", step, "[DONE] --> [DIVERSE]");
					divert_method = "update_word";
					divert_data = data;
					return dal.transact_stat_CEASE;
				}
				else if(step == 4 && result.length > 0) {
					console.log("TANSACTION STEP - ", step, "[LOGICALLY_CEASE]");
					return dal.transact_stat_FINISH;
				}
				console.log("TANSACTION STEP - ", step, "[DONE]");
				return dal.transact_stat_CONTINUE;
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