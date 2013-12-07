(function() {
	"use strict";

	var walk = require('walk'),
		fs = require('fs'),
		cachebustString = (new Date()).getTime().toString(),

		// Functions
		findScripts,
		loadScript,
		loadScriptList,
		loadScriptsFromPath;

	/**
	 * Recursively looks for script files in the given directory.
	 *
	 * @param  {String}    path      Path to the directory
	 * @param  {Function}  callback  Callback that will be supplied the found files
	 *
	 * @return  {void}
	 */
	findScripts = function(path, callback) {
		var walker = walk.walk(path),
			files = [];

		walker.on('file', function(root, fileStats, next) {
			if (fileStats.name.substr(-3) === '.js') {
				files.push(root + '/' + fileStats.name);
			}

			next();
		});

		walker.on('end', function() {
			callback(files);
		});
	};

	/**
	 * Loads a single script file on the page.
	 *
	 * @param  {String}    url       Url to the script file
	 * @param  {Function}  callback  Callback to call after the script has loaded
	 *
	 * @return  {void}
	 */
	loadScript = function(url, callback) {
		var script = document.createElement('script');
		script.src = url + '?' + cachebustString;

		script.addEventListener('load', function() {
			callback();
		});

		document.body.appendChild(script);
	};

	/**
	 * Loads an array of script files on the page.
	 *
	 * @param  {Array}     scriptList  An array of script files
	 * @param  {Function}  callback    Callback to call once all of the scripts are loaded
	 *
	 * @return  {void}
	 */
	loadScriptList = function(scriptList, callback) {
		var scriptsToLoad = scriptList.length,
			scriptsLoaded = 0,
			incrementLoaded,
			i;

		incrementLoaded = function() {
			scriptsLoaded++;

			if (scriptsLoaded === scriptsToLoad) {
				callback();
			}
		};

		for (i = 0; i < scriptsToLoad; i++) {
			loadScript(scriptList[i], incrementLoaded);
		}
	};

	/**
	 * Finds all script files in 'path' and loads those as script tags on the page.
	 *
	 * @param  {String}    path      Path to read recursively for script files
	 * @param  {Mixed}    newRoot   The portion of 'path' in the script file paths will be replaced with this
	 * @param  {Function}  callback  Callback to call once all of the scripts have loaded
	 *
	 * @return  {void}
	 */
	loadScriptsFromPath = function(path, newRoot, callback) {
		findScripts(path, function(scripts) {
			var pathLength = path.length;

			// Replace "path" with "root"
			scripts = scripts.map(function(script) {
				return newRoot + script.substr(pathLength);
			});

			loadScriptList(scripts, function() {
				callback();
			});
		});
	};

	window.loadScripts = function(path, newRoot, callback) {
		// Allow using only path and callback
		if (typeof newRoot === 'function' && typeof callback === 'undefined') {
			callback = newRoot;
			newRoot = path;
		}

		// Allow using without explicit newRoot
		if (newRoot === null || typeof newRoot === 'undefined') {
			newRoot = path;
		}

		// No callback?
		if (typeof callback === 'undefined') {
			callback = function() {};
		}

		loadScriptsFromPath(path, newRoot, callback);
	};
})();