const _ = require('lodash');

const securityConstant = require('../constants/security.constant');

module.exports = async function (req, res, securityURI) {
	const ctx = req.$ctx;
	const { method, url } = req;
	const arrPath = _.split(url, '/').slice(1);
	const project = arrPath.shift();
	req.url = `/${project}/${arrPath.join('~') || 'NONE'}`;

	ctx.meta = {
		method: req.method,
		headers: { ...req.headers }
	};
	return true;
};
