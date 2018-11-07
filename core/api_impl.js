function init(callback) {
	callback(true);
}

function process(params) {
	var func = params.func;

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
		case 'inform':
		break;
	}

	return "";
}

function deinit() {
}

module.exports = {
	init,
	process,
	deinit
}