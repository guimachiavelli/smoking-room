###########################################################################
###########################################################################
#
#		Digital smoking room
#
###########################################################################
###########################################################################

'use strict'

##setting up the server
http = require 'http'
express = require 'express'
app = express()

port = process.env.PORT || 3000

server = http.createServer app
server = server.listen port
####

# attach socket to server
io = require('socket.io').listen server

# requiring and declaring needed libs/vars
jade = require 'jade'
routes = require './lib/routes.coffee'
users = {}

## server configs
app.configure () ->
	app.use express.favicon(__dirname + '/public/fav.png')
	app.use express.bodyParser()
	# setting up jade templating engine
	app.engine 'jade', jade.__express
	app.set 'view engine', 'jade'
	app.set 'views', __dirname + '/views'
	app.set 'view options', {layout: false}
	app.use express.static(__dirname + '/public')

	# getting rid of pesky verbose socket.io logs
	io.set 'log level', 2


# starting socket magic
io.sockets.on 'connection', (socket) ->

	# send sessionid to the user on connection
	socket.emit 'userid', socket.id


	socket.on 'user enter', (data)->
		# on user connection, add it to the users object
		users[socket.id] = { name: data.username, avatar: data.avatar }
		io.sockets.emit 'users', users

	# when a user sets a new avatar,
	# emit it to all users
	socket.on 'set avatar', (data) ->
		users[socket.id].avatar = data
		io.sockets.emit 'users', users

	# when a user picks a cigarette
	# emit it to all users
	socket.on 'set cig', (data) ->
		users[socket.id].cig = data
		io.sockets.emit 'users', users

	# when a user picks a cigarette
	# emit it to all users
	socket.on 'set user', (data) ->
		users[socket.id].name = data
		io.sockets.emit 'users', users

	# when a user sends an image
	# emit it to all users
	socket.on 'message', (data) ->
		message = users[socket.id].name + ': ' + data
		io.sockets.emit 'message', message

	# on disconnect, remove user from our user object
	socket.on 'disconnect', () ->
		io.sockets.emit 'message', users[socket.id].name + ' disconnected'
		delete users[socket.id]
		io.sockets.emit 'users', users

app.get '/', routes.getIndex
app.get '/chat', routes.getChat
app.get '/selfie', routes.getSelfie
