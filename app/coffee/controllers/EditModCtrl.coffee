angular.module('starloader').controller 'EditModCtrl', [
	'$scope', '$route', '$routeParams', '$location', 'config', 'confirmationModal', 'infoModal', 'modEditor', 'modRepository', 'inputModal'
	($scope,   $route,   $routeParams,   $location,   config,   confirmationModal,   infoModal,   modEditor,   modRepository,   inputModal) ->
		fs = require 'fs'
		pathUtil = require 'path'
		
		modMeta = modEditor.getMetaData()		
		modFiles = []	
		flatFiles = []

		$scope.mod = angular.extend {}, modMeta
		
		$scope.resetModInfo = () ->
			$scope.mod = angular.extend {}, modMeta
		
		$scope.saveModInfo = () ->
			if $scope.modinfo.$valid is false
				infoModal.activate {
					title: 'Error'
					text: 'Invalid mod info'
				}
				return
			if $scope.mod['internal-name'] isnt modMeta['internal-name'] 
				modRepository.remove modMeta
			modMeta = $scope.mod
			modEditor.saveMod modMeta
			infoModal.activate {
				title: 'Success'
				text: 'Successfully saved mod info'
			}
			
		$scope.deleteFile = () ->
			fileNodes = $("#filetree").dynatree("getTree").getSelectedNodes(true)
						
			confirmMsg = ''
			if fileNodes.length is 1
				if fileNodes[0].data.isFolder 
					confirmMsg = 'Really delete folder: ' + fileNodes[0].data.title + '?'
				else
					confirmMsg = 'Really delete file: ' + fileNodes[0].data.title + '?'
			else
				confirmMsg = 'Really delete ' + fileNodes.length + ' files?'
				
			confirmationModal.activate {
				title: 'Delete'
				text: confirmMsg
				yes: () ->
					for nd in fileNodes
						if isMetaFile flatFiles[nd.data.key] 
							infoModal.activate {
								title: 'Error'
								text: 'Cant delete mod.json'
							}
						else
							modEditor.deleteSomething flatFiles[nd.data.key]
							nd.remove()
			}
			
		$scope.refreshFiles = () ->
			treeNodes = []
			flatFiles = []
			modEditor.scanFiles()
			modFiles = modEditor.getFiles()
			buildTree modFiles, treeNodes
			$("#filetree").dynatree("getTree").options.children = treeNodes
			$("#filetree").dynatree("getTree").reload()
			sortTree()
			
		$scope.renameFile = () ->
			fileNodes = $("#filetree").dynatree("getTree").getSelectedNodes(true)
			if fileNodes.length is 1
				fileInfo = flatFiles[fileNodes[0].data.key]
				if isMetaFile fileInfo
					infoModal.activate {
						title: 'Error'
						text: 'Cant rename mod.json'
					}
				else
					validName = false
					inputModal.activate {
						title: 'Rename'
						text: 'Enter new name'
						value: fileInfo.name
						
						validate: (newValue) ->
							if newValue.trim() is ""
								return "Please enter a name"
							else
								newFileName = pathUtil.join fileInfo.path, newValue
								if fs.existsSync newFileName 
									stat = fs.lstatSync newFileName
									if (fileInfo.type is "folder" and stat.isDirectory()) or (fileInfo.type isnt "folder" and stat.isDirectory() is false)
										return "Name in use"
										
						
						okay: (newValue) ->
							newName = newValue.trim()
							newFileName = pathUtil.join fileInfo.path, newName
							fs.renameSync fileInfo.fullName, newFileName
							fileInfo.name = newName
							fileInfo.fullName = newFileName
							fileNodes[0].data.title = newName
							sortTree()
					}
				
		buildTree = (files, nodes) ->	
			for file in files
				fileID = (flatFiles.push file) - 1
				if file.type is "folder" 
					subNodes = []
					buildTree file.subfiles, subNodes
					nodes.push { "title": file.name, "isFolder": true, "children": subNodes, "key": fileID }
				else
					nodes.push { "title": file.name, "key": fileID }
					
		getNodeDirectory = (node) ->
			dirNode = node
			while dirNode.data.isFolder is false
				dirNode = dirNode.getParent()
				if dirNode is null 
					return modRepository.getPath modMeta, null, true
			return flatFiles[dirNode.data.key].fullName
			
		sortTree = () ->
			$("#filetree").dynatree("getRoot").sortChildren (a, b) ->
				if a.data.isFolder and b.data.isFolder is false
					return -1
				else if a.data.isFolder is false and b.data.isFolder 
					return 1
				else
					a = a.data.title.toLowerCase()
					b = b.data.title.toLowerCase()
					return if a > b then 1 else if a < b then -1 else 0
			, true
			
		isMetaFile = (file) ->
			path = modRepository.getPath modMeta, null, true
			metaPath = pathUtil.join path, "mod.json"
			return file.fullName is metaPath

		$("#filetree").dynatree {
			title: "filetree"
			minExpandLevel: 1
			imagePath: "/img/tree/"
			debugLevel: 1
			clickFolderMode: 1
			selectMode: 2
			autoFocus: false
			
			onClick: (node, event) ->
				if node.getEventTargetType(event) in ["icon", "title"]
					if event.ctrlKey
						node.toggleSelect()
					else
						selNodes = node.tree.getSelectedNodes()
						for nd in selNodes
							nd.select false
						node.select true
					return false		
					
			dnd: {
				autoExpandMS: 600
				preventVoidMoves: true
				
				onDragStart: (node) ->
					return true
					
				onDragEnter: (node, sourceNode) ->
					return true
					
				onDragOver: (node, sourceNode, hitMode) ->
					if node.isDescendantOf sourceNode
						return false
						
					if node.data.isFolder is false and hitMode is "over" 
						return false
				
				onDrop: (node, sourceNode, hitMode, ui, draggable) ->	
					sourceFile = flatFiles[sourceNode.data.key]
					if isMetaFile sourceFile
						infoModal.activate {
							title: 'Error'
							text: 'Cant move mod.json'
						}
					else
						destDirectory = getNodeDirectory node
						destFileName = pathUtil.join destDirectory, sourceFile.name
						fs.renameSync sourceFile.fullName, destFileName
						sourceFile.fullName = destFileName
						sourceNode.move node, hitMode
						sortTree()
			}
		}
		
		$scope.refreshFiles()
]