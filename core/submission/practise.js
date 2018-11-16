/**
Practise rules description
SCORE Formulations:
[1] All incipient words are with a SCORE 0.
[2] Any word confirmed as "forgot" will has its SCORE set to SCORE-10.
[3] Any word confirmed as "learnt" will has its SCORE operate +10, and to be derelicted from preparing pool.

DEVIANCE Formulations:
stages: {1, 2, 4, 7, 15}
[1] Any trigger includes "forgot" or "learnt" will cause an updating to DEVIANCE based on STRENGTH level.
[2] System will automatically deduct DEVIANCE by 1 every 4:00 am.
[3] The minimum DEVIANCE value is 1.

STRENGTH Formulations:
level: {0, 1, 2, 3, 4}
[1] Any word confirmed as "forgot" will has its STRENGTH set to 0.
[2] Word confirmed as "learnt" will has its STRENGTH to the next level (max is 4).

*/
const dal = ('./dal_impl.js');

const __level = [0, 1, 2, 3, 4];
const __stage = [1, 2, 4, 7, 15];

function update_deviance_everyday(deviance) {
	if(deviance <= __stage[0]) {
		return __stage[0];
	}
	else {
		return deviance - 1;
	}
}

function confirm_learnt(strength, deviance, score) {

	/* confirm too early */
	if(deviance > 0) {
		return  {
					"strength" : strength,
					"deviance" : deviance,
					"score" : score
				};
	}

	var tmp_strength = strength;
	var tmp_deviance = deviance;
	var tmp_score = score;

	tmp_strength = strength >= __level[__level.length - 1] ? __level[__level.length - 1] : strength + 1;
	tmp_deviance = __stage[tmp_strength];
	if(tmp_score < 0)
		tmp_score = 0;
	else
		tmp_score = score + 10;

	return {
		"strength" : tmp_strength,
		"deviance" : tmp_deviance,
		"score" : tmp_score
	};
}

function confirm_forgot(strength, deviance, score) {

	var tmp_strength = __level[0];
	var tmp_deviance = __stage[tmp_strength];
	var tmp_score = score - 10;

	return {
		"strength" : tmp_strength,
		"deviance" : tmp_deviance,
		"score" : tmp_score
	};
}

module.exports = {
	update_deviance_everyday,
	confirm_learnt,
	confirm_forgot
};