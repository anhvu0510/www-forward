/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-useless-catch */
const _ = require('lodash');
const Axios = require('axios');
const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const { params } = ctx.params;

		const { project, pathAPI } = params;
		const { method, headers: headersRequest = {} } = ctx.meta;

		const forwardProject = process.env.FORWARD_PROJECT;
		if (_.isEmpty(forwardProject) === true) {
			throw new MoleculerError('Project Not Found');
		}

		const projects = _.split(forwardProject.replace(/'/gi, ''), '&');
		console.log('forwardProject', forwardProject);
		console.log('projects', projects);

		const projectConfig = Object.fromEntries(projects.map((item) => JSON.parse(item)));

		console.log('projectConfig', projectConfig);
		const host = projectConfig[_.toLower(project)];
		if (!!host === false) {
			throw new MoleculerError('Project Not Found (E0002)');
		}

		const redirectPath = `${host}/${pathAPI !== 'NONE' ? `${pathAPI.replace(/~/gi, '/')}` : ''}`;

		delete headersRequest.host;
		this.logger.info('METHOD:::', method, ' --- ', 'RequestURL:::', redirectPath);
		const axiosConfig = {
			method,
			url: redirectPath,
			headers: headersRequest,
			data: ctx.params.body
		};
		const result = await Axios(axiosConfig);

		return result?.data || {};
	} catch (error) {
		console.error(error);
		if (error.name === 'MoleculerError') {
			throw error;
		}
		return error?.response?.data || { errorMessage: error?.message, errorData: error?.data || null };
	}
};
