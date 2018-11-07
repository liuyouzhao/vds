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
function insert_new_words(new_words) {

	var sql_head = 'INSERT INTO vds_vocabulary(`voc_spell`, `voc_function`, `voc_property`, `voc_example`) VALUES ?';
	var sql_values = [];

	for(var i = 0; i < new_words.length; i ++) {

		sql_values[i] = [	new_words[i]['spell'], 
							new_words[i]['function'], 
							new_words[i]['property'], 
							new_words[i]['example']
						];
	}

	mysql_connection.query(sql_head, [sql_values], function(err,result) {
	    if(err) {
	    	console.log('INSERT ERROR - ', err);
	    	throw err;
	    }
	    console.log('show result:',result);
	    console.log('show result:',result.affectedRows);
	});
}

function deinit() {
	mysql_connection.end();
}


module.exports = {
	init,
	insert_new_words,
	deinit
}