

module.exports = {
	
	getIndex: (req, res) ->
		res.render 'index'


	getChat: (req, res) ->
		res.render 'chat'


	getSelfie: (req, res) ->
		res.render 'selfie'
}
