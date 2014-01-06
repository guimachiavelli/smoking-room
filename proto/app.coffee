###########################################################################
###### E-cigs ########################################################
#

#
###########################################################################
###########################################################################

'use strict'

http = require 'http'
jade = require 'jade'
express = require 'express'
app = express()

server = http.createServer app
server = server.listen 3000

io = require('socket.io').listen server


routes = require './routes/routes.coffee'

app.configure () ->
	app.use express.favicon(__dirname + '/public/fav.png')
	app.use express.bodyParser()
	app.engine 'jade', jade.__express
	app.set 'view engine', 'jade'
	app.set 'views', __dirname + '/views'
	app.set 'view options', {layout: false}
	app.use express.static(__dirname + '/public')

	#io.set 'log level', 2

io.sockets.on 'connection', (socket) ->
	#setInterval ->
	#	console.log 123
	#, 1001
	
	socket.on 'video', (data) ->
		console.log data
	
	socket.on 'pseudo', (data) ->
		socket.set 'pseudo', data

	socket.on 'message', (message) ->
		socket.get 'pseudo', (error, name) ->
			data = { 'message': message, 'pseudo' : name}
			socket.broadcast.emit 'message', data
			console.log 'user ' + name + ' sent this ' + message

	socket.on 'disconnect', () ->
		io.sockets.emit 'user disconnected'

	socket.on 'end', () ->
		io.sockets.emit 'user disconnected'



app.get '/', routes.getIndex
app.get '/chat', routes.getChat


