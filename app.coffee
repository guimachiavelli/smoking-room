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

port = process.env.PORT || 3000

server = http.createServer app
server = server.listen port

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

users = {}

io.sockets.on 'connection', (socket) ->
	users[socket.id] = {name: 'anon#' + socket.id.substr(0, 5), avatar: null, cig: null}
	io.sockets.emit 'message', users[socket.id].name + ' connected'


	socket.on 'set avatar', (data) ->
		users[socket.id].avatar = data
		io.sockets.emit 'users', users

	socket.on 'set mouth', (data) ->
		users[socket.id].avatar = data
		io.sockets.emit 'users', users

	socket.on 'set cig', (data) ->
		users[socket.id].cig = data
		io.sockets.emit 'users', users



	socket.on 'set user', (data) ->
		users[socket.id].name = data
		io.sockets.emit 'users', users


	socket.on 'message', (data) ->
		message = users[socket.id].name + ': ' + data
		io.sockets.emit 'message', message

	socket.on 'disconnect', () ->
		io.sockets.emit 'message', users[socket.id].name + ' disconnected'
		delete users[socket.id]
		io.sockets.emit 'users', users
		


	
	broadcastStuff = () ->
		username = null
		avatar = null

		socket.get 'user', (e, name) ->
			username = name

		socket.get 'avatar', (e, image64) ->
			avatar = image64



	



app.get '/', routes.getIndex
app.get '/chat', routes.getChat
app.get '/selfie', routes.getSelfie


