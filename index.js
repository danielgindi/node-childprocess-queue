'use strict';

var ChildProcess = require('child_process');

var last_unique_id = 0;

var generateUniqueId = function () {
    last_unique_id++;
    return '_' + last_unique_id;
};

/**
 * @returns {{
 *   setMaxProcesses: (function(int)),
 *   getMaxProcesses: (function(): int),
 *   getCurrentProcessCount: (function(): int),
 *   getCurrentProcesses: (function(): Array.<ChildProcess>),
 *   getCurrentQueueSize: (function(): int),
 *   removeFromQueue: (function(String): Boolean),
 *   fork: (function(...[*]): String),
 *   spawn: (function(...[*]): String),
 *   exec: (function(...[*]): String),
 *   exec1: (function(...[*]): String),
 *   execFile: (function(...[*]): String),
 *   newQueue: newQueue
 * }}
 */
var newQueue = function newQueue () {

    var MAX_PROCESSES = 5;

    var QUEUE = [];
    var MAP = {};
    var PROCESSES = [];

    var removeTerminatedProcess = function (process) {

        for (var i = 0; i < PROCESSES.length; i++) {
            if (PROCESSES[i] === process) {
                PROCESSES.splice(i, 1);
                break;
            }
        }

        setImmediate(tryToReleaseQueue);
    };

    var tryToReleaseQueue = function () {

        if (PROCESSES.length >= MAX_PROCESSES || !QUEUE.length) {
            return false;
        }

        var next = QUEUE.shift();
        delete MAP[next.id];

        var args = next.args;

        if (next.hasTerminateCallback) {
            var oldTerminateCallback;
            if (typeof args[args.length - 1] === 'function') {
                oldTerminateCallback = args[args.length - 1];
            }

            //noinspection UnnecessaryLocalVariableJS
            var terminateCallback = function () {

                removeTerminatedProcess(process);

                if (oldTerminateCallback) {
                    oldTerminateCallback.apply(this, arguments);
                }
            };

            args[oldTerminateCallback ? args.length - 1 : args.length] = terminateCallback;
        }

        var process = ChildProcess[next.func].apply(ChildProcess, args);
        PROCESSES.push(process);

        process.on('exit', function () {
            removeTerminatedProcess(process);
        });

        if (next.callback) {
            next.callback(process);
        }

        return true;
    };

    var cloneObject = function (o) {
        var clone = {};
        
        if (o === null || typeof o !== 'object') {
            return clone;
        }

        var keys = Object.keys(o);
        for (var i = keys.length - 1; i >= 0; i--)
        {
            clone[keys[i]] = o[keys[i]];
        }
        
        return clone;
    };
    
    var extractOnCreateFromArgs = function (args) {

        for (var i = 0, length = args.length; i < length; i++) {
            if (Array.isArray(args[i])) {
                continue;
            }
            if (typeof args[i] !== 'object') {
                continue;
            }

            var options = cloneObject(args[i]);
            var onCreate = options['onCreate'];
            delete options['onCreate'];
            args[i] = options;
            return onCreate;
        }

        return null;
    };

    //noinspection JSUnusedGlobalSymbols
    var improvedChildProcess = {

        setMaxProcesses: function setMaxProcesses (max) {
            MAX_PROCESSES = max || 5;
            tryToReleaseQueue();
            return this;
        },

        getMaxProcesses: function getMaxProcesses () {
            return MAX_PROCESSES;
        },

        getCurrentProcessCount: function getCurrentProcessCount () {
            return PROCESSES.length;
        },

        getCurrentProcesses: function getCurrentProcesses () {
            return PROCESSES.slice(0);
        },

        getCurrentQueueSize: function getCurrentQueueSize () {
            return QUEUE.length;
        },

        removeFromQueue: function (id) {

            if (MAP.hasOwnProperty(id)) {
                delete MAP[id];
                return true;
            }

            return false;
        },

        fork: function fork (modulePath /*, args, options*/) {

            var args = Array.prototype.slice.call(arguments, 0);
            var onCreate = extractOnCreateFromArgs(args);

            var task = {
                func: 'fork',
                args: args,
                callback: onCreate,
                hasTerminateCallback: false,
                id: generateUniqueId()
            };
            QUEUE.push(task);
            MAP[task.id] = task;

            tryToReleaseQueue();

            return task.id;
        },

        spawn: function spawn (command /*, args, options*/) {

            var args = Array.prototype.slice.call(arguments, 0);
            var onCreate = extractOnCreateFromArgs(args);

            var task = {
                func: 'spawn',
                args: args,
                callback: onCreate,
                hasTerminateCallback: false,
                id: generateUniqueId()
            };
            QUEUE.push(task);
            MAP[task.id] = task;

            tryToReleaseQueue();

            return task.id;
        },

        exec: function exec (command /*, options, callback*/) {

            var args = Array.prototype.slice.call(arguments, 0);
            var onCreate = extractOnCreateFromArgs(args);

            var task = {
                func: 'exec',
                args: args,
                callback: onCreate,
                hasTerminateCallback: true,
                id: generateUniqueId()
            };
            QUEUE.push(task);
            MAP[task.id] = task;

            tryToReleaseQueue();

            return task.id;
        },

        execFile: function execFile (file /*, args, options, callback*/) {

            var args = Array.prototype.slice.call(arguments, 0);
            var onCreate = extractOnCreateFromArgs(args);

            var task = {
                func: 'exec',
                args: args,
                callback: onCreate,
                hasTerminateCallback: true,
                id: generateUniqueId()
            };
            QUEUE.push(task);
            MAP[task.id] = task;

            tryToReleaseQueue();

            return task.id;
        }

    };

    improvedChildProcess.newQueue = newQueue;
    
    //noinspection JSValidateTypes
    return improvedChildProcess;

};

/**
 * @type {{
 *   setMaxProcesses: (function(int)),
 *   getMaxProcesses: (function(): int),
 *   getCurrentProcessCount: (function(): int),
 *   getCurrentProcesses: (function(): Array.<ChildProcess>),
 *   getCurrentQueueSize: (function(): int),
 *   removeFromQueue: (function(String): Boolean),
 *   fork: (function(...[*]): String),
 *   spawn: (function(...[*]): String),
 *   exec: (function(...[*]): String),
 *   execFile: (function(...[*]): String),
 *   newQueue: newQueue
 * }}
 */
module.exports = newQueue();