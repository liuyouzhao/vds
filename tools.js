const fs = require('fs');
const dal = require('./core/dal_impl.js');

function insert_words_from_jsonfile(file) {
	fs.readFile(file, (err, data) => {
		if (err) throw err;

		dal.init(function(sta) {
			console.log(sta);
		});

		var strdata = data.toString();
		//console.log(strdata);
		var json = JSON.parse(strdata);
		console.log(json);
		dal.insert_new_words( function(err, result) {
			},
			json);

		dal.deinit();
	});
}

function insert_section_bindings_fromfile(filename) {
	fs.readFile(filename, (err, data) => {
		if (err) throw err;

		dal.init(function(sta) {
			console.log(sta);
		});

		var strdata = data.toString();
		var words_list = strdata.split(/[\n,]/g);
		for (var i = words_list.length - 1; i >= 0; i--) {
			words_list[i] = words_list[i].replace(/[\r\n]/g, "");
		}

		for(var i = 0; i < words_list.length; i ++) {
			var data = {
				"section_id" : "41,42",
				"voc_spell" : words_list[i]
			}

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
						//__on_exception(session, err);
						return dal.transact_stat_CEASE;
					}
					else {
						if(result.length > 0) {
							console.log("TANSACTION STEP - ", step, "[LOGICALLY_CEASE]");
							//__on_ok(session, "section duplicated");
							return dal.transact_stat_CEASE;
						}
						else {
							console.log("TANSACTION STEP - ", step, "[DONE]");
						}
					}
					return dal.transact_stat_CONTINUE;
				},
				function (err, finished) {
					if(finished) {
						console.log("TANSACTION STEP - ALL ", "[FINISHED]");
						//__on_ok(session, "success");
					}
					else if(err) {
						//__on_exception(session, err);
				}
			});
		}

		//dal.deinit();
	});
}
insert_section_bindings_fromfile('./db/[41-42]Status-Language.txt');
//insert_words_from_jsonfile('./db/new_words_to_insert.json');