'use strict';

var ChildProcess = require('child_process');

/**
 * @returns {{
 *   setMaxProcesses: (function(int)),
 *   getMaxProcesses: (function(): int),
 *   getCurrentProcessCount: (function(): int),
 *   getCurrentProcesses: (function(): Array.<ChildProcess>),
 *   getCurrentQueueSize: (function(): int),
 *   fork: (function(...[*])),
 *   spawn: (function(...[*])),
 *   exec: (function(...[*])),
 *   execFile: (function(...[*])),
 *   newQueue: newQueue
 * }}
 */
var newQueue = function newQueue () {

    var MAX_PROCESSES = 5;

    var QUEUE = [];
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

        fork: function fork (modulePath /*, args, options*/) {

            var args = Array.prototype.slice.call(arguments, 0);
            var onCreate = extractOnCreateFromArgs(args);

            QUEUE.push({
                func: 'fork',
                args: args,
                callback: onCreate,
                hasTerminateCallback: false
            });

            tryToReleaseQueue();

            return this;
        },

        spawn: function spawn (command /*, args, options*/) {

            var args = Array.prototype.slice.call(arguments, 0);
            var onCreate = extractOnCreateFromArgs(args);

            QUEUE.push({
                func: 'spawn',
                args: args,
                callback: onCreate,
                hasTerminateCallback: false
            });

            tryToReleaseQueue();

            return this;
        },

        exec: function exec (command /*, options, callback*/) {

            var args = Array.prototype.slice.call(arguments, 0);
            var onCreate = extractOnCreateFromArgs(args);

            QUEUE.push({
                func: 'exec',
                args: args,
                callback: onCreate,
                hasTerminateCallback: true
            });

            tryToReleaseQueue();

            return this;
        },

        execFile: function execFile (file /*, args, options, callback*/) {

            var args = Array.prototype.slice.call(arguments, 0);
            var onCreate = extractOnCreateFromArgs(args);

            QUEUE.push({
                func: 'exec',
                args: args,
                callback: onCreate,
                hasTerminateCallback: true
            });

            tryToReleaseQueue();

            return this;
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
 *   fork: (function(...[*])),
 *   spawn: (function(...[*])),
 *   exec: (function(...[*])),
 *   execFile: (function(...[*])),
 *   newQueue: newQueue
 * }}
 */
module.exports = newQueue();