const mysql = require('mysql');
const __step__ = require('../thirdparty/step.js');
var mysql_connection = null;

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
				stepdone(stack_id);
			}
			stack_id ++;

			if(!(methods[stack_id])) {
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
	deinit
}