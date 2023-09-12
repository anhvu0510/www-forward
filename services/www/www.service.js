/* eslint-disable import/no-extraneous-dependencies */
const _ = require('lodash');
const Ngrok = require('ngrok');
const ApiGateway = require('moleculer-web-extends');
const { MoleculerError } = require('moleculer').Errors;

const instance = {
	securityURI: {},
	auth: {}
};
const securityURI = {};

module.exports = {
	name: 'api',
	mixins: [ApiGateway],

	ngrok: null,
	dependencies: [/* 'security' */],

	// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
	settings: {
		// Exposed port
		port: process.env.PORT,
		// Exposed IP
		ip: process.env.IP,

		customs: {
			hooks: {
				async onRequest(req, res) {
					await require('./hooks/onRequest.hook')(req, res, instance.securityURI);
				},
				onPreResponse: require('./hooks/onPreResponse.hook'),
				onHasBody: require('./hooks/onHasBody.hook')
			}
		},

		cors: {
			// Configures the Access-Control-Allow-Origin CORS header.
			origin: '*',
			// Configures the Access-Control-Allow-Methods CORS header.
			methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
			// Configures the Access-Control-Allow-Headers CORS header.
			allowedHeaders: ['*', 'Content-Type', 'x-api-key', 'x-api-validate', 'x-api-action', 'x-api-client', 'x-request-id', 'Authorization'],
			// Configures the Access-Control-Expose-Headers CORS header.
			exposedHeaders: ['*', 'x-api-key', 'x-api-validate', 'x-api-action', 'x-api-client'],
			// Configures the Access-Control-Allow-Credentials CORS header.
			credentials: true,
			// Configures the Access-Control-Max-Age CORS header.
			maxAge: 3600
		},

		// Global Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
		use: [],

		routes: [
			{
				path: '/',
				whitelist: [
					'**'
				],

				// Route-level Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
				use: [],

				// Enable/disable parameter merging method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Disable-merging
				mergeParams: false,

				// Enable authentication. Implement the logic into `authenticate` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authentication
				authentication: true,

				// Enable authorization. Implement the logic into `authorize` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authorization
				authorization: true,

				// The auto-alias feature allows you to declare your route alias directly in your services.
				// The gateway will dynamically build the full routes from service schema.
				autoAliases: true,

				aliases: {

				},

				callingOptions: {},

				bodyParsers: {
					json: {
						strict: false,
						limit: '1MB'
					},
					urlencoded: {
						extended: true,
						limit: '1MB'
					}
				},

				// Mapping policy setting. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Mapping-policy
				mappingPolicy: 'restrict', // Available values: "all", "restrict"

				// Enable/disable logging
				logging: true
			}
		],

		onError(req, res, err) {
			this.logger.info(`[www] Request Error: ${err}`);
			this.logger.info(`[www] Request RES: ${res}`);
			res.setHeader('Content-Type', 'application/json');
			if (err.code === 422) {
				const errorFields = _.get(err, 'data', {});
				this.logger.info(`[www] Request Error 422: ${JSON.stringify(errorFields)}`);
				res.writeHead(err.code, err.message);
				res.end(JSON.stringify({
					code: err.code,
					message: 'Tham số truyền vào không hợp lệ, xin vui lòng thử lại'
				}));
			} else {
				const errorCode = err.code <= 500 && err.code >= 100 ? err.code : 500;
				res.writeHead(errorCode);
				res.end(JSON.stringify({
					code: errorCode,
					message: _.get(err, 'name', null) === 'MoleculerError' ? err.message : 'Máy chủ đang bảo trì, xin vui lòng thử lại sau'
				}));
			}
		},
		// Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
		log4XXResponses: false,
		// Logging the request parameters. Set to any log level to enable it. E.g. "info"
		logRequestParams: null,
		// Logging the response data. Set to any log level to enable it. E.g. "info"
		logResponseData: 'null',

		// Serve assets from "public" folder. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Serve-static-files
		assets: {
			folder: 'public',

			// Options to `server-static` module
			options: {}
		}
	},
	actions: {
		forwardGET: {
			rest: {
				method: 'GET',
				fullPath: '/:project/:pathAPI',
				auth: false
			},
			params: {
				body: { $$type: 'object|optional' }
			},
			timeout: 180 * 1000,
			handler: require('./actions/forward.action')
		},
		forwardPOST: {
			rest: {
				method: 'POST',
				fullPath: '/:project/:pathAPI',
				auth: false
			},
			params: {
				body: { $$type: 'object|optional' }
			},
			timeout: 180 * 1000,
			handler: require('./actions/forward.action')
		},
		forwardPUT: {
			rest: {
				method: 'PUT',
				fullPath: '/:project/:pathAPI',
				auth: false
			},
			params: {
				body: { $$type: 'object|optional' }
			},
			timeout: 180 * 1000,
			handler: require('./actions/forward.action')
		},
		forwardDELETE: {
			rest: {
				method: 'DELETE',
				fullPath: '/:project/:pathAPI',
				auth: false
			},
			params: {
				body: { $$type: 'object|optional' }
			},
			timeout: 180 * 1000,
			handler: require('./actions/forward.action')
		}

	},
	methods: {
		reformatError: require('./methods/reformatError.method'),
		async authenticate(ctx, route, req) {
			const response = await require('./methods/authenticate.method')(ctx, route, req, instance.auth);
			return response;
		},
		authorize: require('./methods/authorize.method')
	},
	events: {
		'$services.changed': function (ctx) {
			instance.securityURI = require('./events/$services.changed.event')(ctx).securityURI;
			instance.auth = require('./events/$services.changed.event')(ctx).auth;
		}
	},

	started() {
		setTimeout(async () => {
			try {
				const config = {
					proto: 'http',
					// web_allow_hosts: true,
					// console_ui: true,
					// console_ui_color: true,
					addr: `${process.env.PORT}`,
					// web_addr: '0.0.0.0:5000',
					// web_allow_hosts: ['0.0.0.0/0', '10.8.103.46'],
					// ip_restriction_allow_cidrs: ['0.0.0.0/0', '10.8.103.46'],
					// compression: true,
					region: 'ap'
				};

				if (process.env.NGROK_AUTH_TOKEN) config.authtoken = process.env.NGROK_AUTH_TOKEN;
				if (process.env.NGROK_HOST_NAME) config.hostname = process.env.NGROK_HOST_NAME;
				console.log('config', config);
				this.ngrok = await Ngrok.connect({ ...config, configPath: './ngrok.yml' });
				console.log(Ngrok.getUrl());
				this.logger.info(`[NGROK]: Ngrok Started with at PORT ::: ${process.env.PORT}  with URL ::: ${this.ngrok}`);
			} catch (error) {
				console.error(error);
				this.logger.info(`[NGROK]: Ngrok Started Error::: ${error?.message}`);
			}
		}, 2000);
	},

	async stopped() {
		try {
			console.log('Stopped..................');
			await Ngrok.disconnect();
			await Ngrok.kill();
		} catch (error) {
			console.error('Stop:::', error);
		}
	}
};
