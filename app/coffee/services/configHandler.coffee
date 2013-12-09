angular.module('starloader').factory 'configHandler', () ->
	fs = require 'fs'
	configFile = './config.json'
	config = {}

	refresh = () ->
		if fs.existsSync configFile
			try
				configJson = fs.readFileSync configFile, {encoding: 'utf8'}
				config = JSON.parse configJson
			catch e
				console.error e.toString()
		else
			create()

		return

	save = (userConfig) ->
		if userConfig?
			angular.extend config, userConfig

		fs.writeFileSync configFile, angular.toJson(config)

		return

	create = () ->
		config = {}
		save()

		return

	refresh()

	return {
		get: () -> config
		refresh: refresh
		save: save
		create: create
	}