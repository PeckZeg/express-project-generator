const reqYAML = require('req-yaml');
const path = require('path');
const _ = require('lodash');

const ENV = 'development';
const ENV_LIST = ['development', 'production'];

module.exports = _.defaults({
    isDev: ENV === 'development',
    env: ENV,
    envList: ENV_LIST,
}, reqYAML(path.join(__dirname, 'config', `${ENV}.yaml`)));