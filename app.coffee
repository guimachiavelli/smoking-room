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
model = require './lib/models.coffee'

users = {}
public_users = []
socket_events = [
		'connection',
		'user enter',
		'user list update',
		'chat request',
		'message',
		'confirm pvt'
		'request accepted'
		'user move'
]

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
	
	# on user connection, add it to the users object
	socket.on 'user enter', (data) ->
		users[data.username] = socket
		users[data.username].set 'name', data.username
		users[data.username].set 'avatar', data.avatar
		users[data.username].set 'pos', data.pos

		public_users = model.updatePublicUserList users

		io.sockets.emit 'user list update', public_users

	# when a user picks a cigarette
	# emit it to all users
	socket.on 'user move', (data) ->
		users[data.username].set 'pos', data.new_pos
		public_users = model.updatePublicUserList users

		io.sockets.emit 'user list update', public_users






	# pvt chat request
	socket.on 'send chat request', (data) ->
		users[data.to].emit 'incoming chat request', data

	# pvt chat request
	socket.on 'refuse chat request', (data) ->
		users[data.to].emit 'chat request refused', data

	# accepted pvt chat
	socket.on 'accept chat request', (data) ->
		users[data.from].set 'chatting_with', data.to
		users[data.to].set 'chatting_with', data.from
		users[data.to].emit 'chat request accepted', data


	socket.on 'close chat', (data) ->
		users[data.from].set 'chatting_with', null
		users[data.to].set 'chatting_with', null
		users[data.to].emit 'close chat', data



	# chatting
	socket.on 'message', (data) ->
		users[data.to].emit 'message', {from: data.from, to: data.to, msg: data.msg }

	# on disconnect, remove user from our user object
	socket.on 'disconnect', () ->
		socket.get 'chatting_with', (err, data)-> 
			users[data].emit 'close chat'
			users[data].set 'chatting_with', null

		socket.get 'name', (err, data)-> delete users[data]


		public_users = model.updatePublicUserList users

		io.sockets.emit 'user list update', public_users


app.get '/', routes.getIndex
