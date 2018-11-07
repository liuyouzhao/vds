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
		dal.insert_new_words(json);

		dal.deinit();
	});
}

insert_words_from_jsonfile('./db/new_words_to_insert.json');