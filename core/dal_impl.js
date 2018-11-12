const mysql = require('mysql');
const __step__ = require('../thirdparty/step.js');
var mysql_connection = null;

const transact_stat_CONTINUE = 0;
const transact_stat_CEASE = -1;
const transact_stat_FINISH = 1;

function __do_mysql_connection(__cb) {
	mysql_connection = mysql.createConnection({
		host 		: 'localhost',
		user 		: 'root',
		password 	: 'Linfeicutui0621',
		database    : 'voc_depot_sys'
	});

	mysql_connection.connect(function (err, result) {
		__cb(err, result);
	});

	mysql_connection.on('error', function(err) {
		if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('db error onset reconnection:' + err.message);
            __do_mysql_connection(function(err, result) {
            	console.log("db CONNECTION resumed.");
            });
        } else {
            throw err;
        }
	});
}


function init(callback) {
	__step__(
		function __s1() {
			__do_mysql_connection(this);
		},
		function __s2(err, result) {
			if(err)
				callback(false);
			else
				callback(true);
		}
	);
}

function start_transaction(methods, daos, stepdone, callback) {

	mysql_connection.beginTransaction(function(err) {
		if(err) {
			throw err;
		}

		var stack_id = -1;
		var status = -100;
		var recuisor = function(err, result){
		
			if(err) {
				console.log('TRANSACTION MYSQL ERROR - ', err);
				mysql_connection.rollback(function(err_rb) {
					console.log('TRANSACTION ROLLBACK - ', err_rb);
					if(err_rb)
						throw err_rb;
		    	});
				callback(err, false);
		    	return;
			}

			if(stack_id >= 0) {
				status = stepdone(stack_id, err, result);
				if(status == transact_stat_CEASE) {
					mysql_connection.rollback(function(err_rb) {
						console.log('TRANSACTION ROLLBACK - ', err_rb);
						if(err_rb)
							throw err_rb;
			    	});
			    	callback(err, false);
			    	return;
				}
			}
			stack_id ++;

			if(!(methods[stack_id]) || status == transact_stat_FINISH) {
				mysql_connection.commit(function(err_cm) {
					if(err_cm) {
						console.log('TRANSACTION COMMIT FAILED - ', err_rb);
						mysql_connection.rollback(function(err_rb) {
							console.log('TRANSACTION ROLLBACK - ', err_rb);
							if(err_rb)
								throw err_rb;
				    	});
				    	callback(err_cm, false);
					}
					else {
						callback(err, true);
					}
				});
				return;
			}

			try {
				methods[stack_id](daos[stack_id], recuisor);
			}
			catch(__ex_inner)
			{
				console.log('TRANSACTION DAL ERROR - ', __ex_inner);
				mysql_connection.rollback(function(err_rb) {
					console.log('TRANSACTION ROLLBACK - ', err_rb);
					if(err_rb)
						throw err_rb;
		    	});
				callback(err, false);
				return;
			}
		}

		recuisor(null, {});
	});
}

function biz_insert_new_word(words_dao, on_next) {
	var sql_head = 'INSERT INTO vds_vocabulary(`voc_spell`, `voc_function`, `voc_property`, `voc_example`) VALUES (?)';
	var sql_values = [	words_dao.spell, 
						words_dao.function, 
						words_dao.property, 
						words_dao.example
	];

	mysql_connection.query(sql_head, [sql_values], function(err, result) {
	    on_next(err, result);
	});
}

function biz_insert_new_practise(practise_dao, on_next) {
	var sql_head = "INSERT INTO `vds_familiarization`(`user_name`, `voc_spell`, `fami_reviewtimes`) VALUES (?)";
	var sql_values = [ 	practise_dao.user_name, 
				  	 	practise_dao.voc_spell,
			   	   		practise_dao.fami_reviewtimes ];

	mysql_connection.query(sql_head, [sql_values], function(err,result) {
	    on_next(err, result);
	});
}

function biz_update_word_days(practise_dao, on_next) {
	var sql_head = "UPDATE `vds_familiarization` SET `fami_reviewtimes`=? WHERE `user_name`=? AND `voc_spell`=?";
	var sql_values = [ 
						practise_dao.fami_reviewtimes, 
						practise_dao.user_name, 
						practise_dao.voc_spell ];
	mysql_connection.query(sql_head, sql_values, function(err,result) {
	    on_next(err, result);
	});
}

function biz_update_word_attributes(words_dao, on_next) {
	var sql_head = "UPDATE `vds_vocabulary` SET `voc_function`=?,`voc_property`=?,`voc_example`=? WHERE `voc_spell`=?"
	var sql_values = [
		words_dao.function, 
		words_dao.property, 
		words_dao.example,
		words_dao.spell
	];
	mysql_connection.query(sql_head, sql_values, function(err, result) {
	    on_next(err, result);
	});
}

function biz_update_word_groupinfo(words_dao, on_next) {
	var sql_head = "UPDATE `vds_vocabulary` SET `group_info`=? WHERE `voc_spell`=?"
	var sql_values = [
		words_dao.spell
	];
	mysql_connection.query(sql_head, sql_values, function(err, result) {
	    on_next(err, result);
	});
}

function biz_query_word_section(word_section_dao, on_next) {
	var sql_head = "SELECT `section_id`, `voc_spell` FROM `vds_section_vocabulary` WHERE `section_id`=? AND `voc_spell`=?";
	var sql_values = [
		word_section_dao.section_id, 
		word_section_dao.voc_spell
	];
	mysql_connection.query(sql_head, sql_values, function(err, result) {
		on_next(err, result);
	});
}

function biz_insert_word_section(word_section_dao, on_next) {
var sql_head = "INSERT INTO `vds_section_vocabulary`(`section_id`, `voc_spell`) VALUES (?)";
	var sql_values = [ 	word_section_dao.section_id, 
				  	 	word_section_dao.voc_spell ];

	mysql_connection.query(sql_head, [sql_values], function(err,result) {
		on_next(err, result);
	});
}

function biz_query_word_info(spell_dao, on_next) {
	var sql_head = "SELECT * FROM `vds_vocabulary` WHERE voc_spell=?";
	var sql_value = spell_dao.spell;
	mysql_connection.query(sql_head, sql_value, function(err, result) {
		on_next(err, result);
	});
}

function biz_query_section_by_word(spell_dao, on_next) {
	var sql_head = "SELECT `section_id` FROM `vds_section_vocabulary` WHERE `voc_spell`=?";
	var sql_values = spell_dao.spell;
	mysql_connection.query(sql_head, sql_values, function(err, result) {
		on_next(err, result);
	});
}

function insert_bind_word_section(word_section_dao, on_finish) {
	var sql_head = "INSERT INTO `vds_section_vocabulary`(`section_id`, `voc_spell`) VALUES (?)";
	var sql_values = [ 	word_section_dao.section_id, 
				  	 	word_section_dao.voc_spell ];

	mysql_connection.query(sql_head, [sql_values], function(err,result) {
		if(err) {
			console.log(err);
		}
	    on_finish(err, result);
	});
}

function query_all_sections(on_finish) {
	var sql_head = "SELECT * FROM `vds_section` WHERE 1";
	mysql_connection.query(sql_head, [], function(err, result) {
		if(err) {
			console.log(err);
		}
	    on_finish(err, result);
	});
}

function search_words(spell_dao, on_finish) {
	var sql_head = "SELECT voc_spell FROM `vds_vocabulary` WHERE voc_spell LIKE ?";
	var sql_value = spell_dao.spell + "%";
	mysql_connection.query(sql_head, sql_value, function(err, result) {
		if(err) {
			console.log(err);
		}
	    on_finish(err, result);
	});
}

function query_word_by_groupinfo(spell_dao, on_finish) {
	var sql_head = "SELECT voc_spell FROM `vds_vocabulary` WHERE group_info LIKE ?";
	var sql_value = '%' + spell_dao.group_info + '%';
	mysql_connection.query(sql_head, sql_value, function(err, result) {
		if(err) {
			console.log(err);
		}
	    on_finish(err, result);
	});
}


function query_word_info(spell_dao, on_finish) {
	var sql_head = "SELECT * FROM `vds_vocabulary` WHERE voc_spell=?";
	var sql_value = spell_dao.spell;
	mysql_connection.query(sql_head, sql_value, function(err, result) {
		if(err) {
			console.log(err);
		}
	    on_finish(err, result);
	});
}



/*
new_words(json):
[
	{
		'spell':'xx',
		'function':'xx',
		'property':'yy',
		'example':'zz'
	},
	{...}
]
*/
function insert_new_words(callback, new_words) {
	var sql_head = 'INSERT INTO vds_vocabulary(`voc_spell`, `voc_function`, `voc_property`, `voc_example`) VALUES ?';
	var sql_values = [];

	for(var i = 0; i < new_words.length; i ++) {

		sql_values[i] = [	new_words[i]['spell'], 
							new_words[i]['function'], 
							new_words[i]['property'], 
							new_words[i]['example']
						];
	}
	console.log(new_words);
	console.log(sql_values);

	mysql_connection.query(sql_head, [sql_values], function(err, result) {
	    if(err) {
	    	console.log('INSERT ERROR - ', err);
	    	throw err;
	    }
	    console.log('show result:', result);
	    callback(err, result);
	});
}

function insert_new_practise(callback, user_name, new_practise) {
	/* Create practise data */
	sql_head = "INSERT INTO `vds_familiarization`(`user_name`, `voc_spell`, `fami_reviewtimes`) VALUES ?";
	sql_values = [];

	for(var i = 0; i < new_practise.length; i ++) {
		var days = new_practise[i]['days'];
		if(!days) {
			days = 0;
		}
		sql_values[i] = [	user_name, 
							new_practise[i]['spell'],
							new_practise[i]['days']
						];
	}
	mysql_connection.query(sql_head, [sql_values], function(err,result) {
	    if(err) {
	    	console.log('INSERT ERROR - ', err);
	    	throw err;
	    }
	    console.log('show result:',result);
	    callback(err, result);
	});
}

function deinit() {
	mysql_connection.end();
}


module.exports = {
	init,
	start_transaction,
	biz_insert_new_word,
	biz_insert_new_practise,
	biz_update_word_days,
	biz_update_word_attributes,
	biz_update_word_groupinfo,
	biz_query_word_section,
	biz_insert_word_section,
	biz_query_word_info,
	biz_query_section_by_word,
	query_all_sections,
	query_word_by_groupinfo,
	insert_bind_word_section,
	search_words,
	query_word_info,
	deinit,

	transact_stat_CONTINUE,
	transact_stat_CEASE,
	transact_stat_FINISH,
}