const reqyaml = require('req-yaml');
const resolve = require('app-root-path').resolve;
const path = require('path');
const _ = require('lodash');

const ENV = 'development';
const ENV_LIST = ['development', 'production'];

module.exports = _.defaults({
    isDev: ENV === 'development',
    env: ENV,
    envList: ENV_LIST,
}, reqyaml(resolve(`config/${ENV}.yaml`))));

