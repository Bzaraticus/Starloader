angular.module('starloader').factory 'config', () ->
	fs = require 'fs'
	configFile = './config.json'
	config = {}

	_refresh = () ->
		if fs.existsSync configFile
			try
				configJson = fs.readFileSync configFile, {encoding: 'utf8'}
				config = JSON.parse configJson
			catch e
				console.error e.toString()
		else
			_init()

		return

	get = (prop) ->
		if prop?
			return config[prop]
		else
			return config

	set = (prop, value) ->
		config[prop] = value
		save()

	save = (userConfig) ->
		if userConfig?
			config = angular.extend {}, config, userConfig

		fs.writeFileSync configFile, angular.toJson(config)

		return

	_init = () ->
		config = {}
		save()

		return

	_refresh()

	return {
		get: get
		set: set
		save: save
	}