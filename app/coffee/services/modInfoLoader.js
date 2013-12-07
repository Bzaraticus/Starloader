/*var modInfos = null;
var modFileLists = null;

function loadModInfos() {
	modInfos = require('../../data/mods.json');
}

function loadModFileLists() {
	modFileLists = require('../../data/modfiles.json');
}

function getModInfo(modInternalName) {
	if (modInfos === null) {
		loadModInfos();
	}

	return modInfos[modInternalName];
}

function getModFileList(modInternalName) {
	if (modFileLists === null) {
		loadModFileLists();
	}

	return modFileLists[modInternalName];
}

function getAllModFileLists() {
	return modFileLists;
}

module.exports = {
	getModInfo: function(modInternalName) {
		return getModInfo(modInternalName);
	},
	
	getModFileList: function(modInternalName) {
		return getModFileList(modInternalName);
	},

	getAllModFileLists: function() {
		return getAllModFileLists();
	}
};*/