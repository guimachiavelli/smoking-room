'use strict'
module.exports =
	model =
		
		updatePublicUserList: (users) ->
			public_users = []

			for username of users
				user = users[username]
				name = avatar = pos = null

				user.get 'name', (err, data) -> name = data
				user.get 'avatar', (err, data) -> avatar = data
				user.get 'pos', (err, data) -> pos = data

				public_user =
					name: name,
					avatar: avatar,
					pos: pos,
					ref: user.id

				public_users.push public_user

			public_users

