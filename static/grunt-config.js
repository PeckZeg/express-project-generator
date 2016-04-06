const TASKS_FOLDER = './tasks';

const reqYAML = require('req-yaml');
const glob = require('glob');
const path = require('path');
const _ = require('lodash');

const appConfig = require('../config');

var config = exports.config = {};
var tasks = exports.tasks = {};
var registerTasks = exports.registerTasks = (grunt) => {
    _.each(tasks, (taskList, taskName) => {
        grunt.registerTask(taskName, taskList);
    });
};

//  Set Livereload & maxListeners
_.set(config, 'watch.options.livereload', appConfig.livereload.port);
_.set(config, 'watch.options.maxListeners', 99);

function setConfigAndTasks(targetName, targetTasks) {

    //  Set Config
    _.each(targetTasks, (task, taskName) => {
        _.set(config, `${taskName}.${targetName}`, task);
    });

    //  Set Tasks
    var taskName = `task/${targetName.replace(/-/g, '/')}`,
        taskList = _.chain(targetTasks).keys().map((taskName) => {
            if (taskName != 'watch') {
                return `${taskName}:${targetName}`;
            }
        }).compact().value();

    _.set(tasks, taskName, taskList);
}

glob.sync('*', { cwd: TASKS_FOLDER, nodir: true }).forEach((fileName) => {
    var targetName = path.basename(fileName, path.extname(fileName)),
        targetTasks = reqYAML(path.join(__dirname, TASKS_FOLDER, fileName));

    setConfigAndTasks(targetName, targetTasks);
});

glob.sync('*/', { cwd: TASKS_FOLDER }).forEach((folderName) => {
    var targetFolder = path.join(__dirname, TASKS_FOLDER, folderName),
        moduleNmae = folderName.replace(/\//g, '');

    glob.sync('*', { cwd: targetFolder, nodir: true }).forEach((fileName) => {
        var targetTasks = reqYAML(paht.join(targetFolder, fileName)),
            targetName = path.basename(fileName, path.extname(fileName)).split('-');

        targetName.splice(1, 0, moduleNmae);
        targetName = targetName.join('-');

        setConfigAndTasks(targetName, targetTasks);
    });
});

if (_.has(config, 'babel')) {
    var babelOptions = _.reduce(config.babel, (memo, task, taskName) => {
        var opts = _.get(memo, 'options', {}),
            files = _.get(memo, 'dist.files', {}),
            taskOpts = _.get(task, 'options'),
            taskFiles = _.get(task, 'files');

        _.set(memo, 'options', _.extend(opts, taskOpts));
        _.set(memo, 'dist.files', _.extend(files, taskFiles));

        return memo;
    }, {});

    _.extend(config.babel, babelOptions);
}

// console.log(JSON.stringify(config, null, 2))
