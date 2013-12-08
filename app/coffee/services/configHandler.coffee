angular.module('starloader').factory 'configHandler', () ->
	fs = require 'fs'
	configFile = './config.json'
	config = {}

	refresh = () ->
		if fs.existsSync configFile
			config = JSON.parse fs.readFileSync(configFile)
		else
			create();
			config = {}

	save = (userConfig) ->
		newConfig = angular.extend {}, config, userConfig
		fs.writeFileSync configFile, JSON.stringify(newConfig)
		refresh()

	create = () ->
		fs.writeFileSync configFile, '{}'

	return {
		get: () -> config
		refresh: refresh
		save: save
		create: create
	}