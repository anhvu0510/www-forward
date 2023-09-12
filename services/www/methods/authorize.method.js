const _ = require('lodash');

module.exports = async function (ctx, route, req) {
	ctx.meta.clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
	ctx.meta.auth = ctx.meta.user;
	ctx.meta.signature = req.headers.signature;
	delete ctx.meta.user;

	/** @dev forward header for service klbVa (Kien Long Bank Virtual Account) */
	const klbVASubUrl = '/supplier/klb/va/';
	if (req.url.includes(klbVASubUrl)) {
	  ctx.meta = {
			...ctx.meta,
			..._.pick(req.headers, ['x-api-client', 'x-api-validate', 'x-api-time'])
	  };
	}
};
