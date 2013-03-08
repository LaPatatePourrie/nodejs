exports.load = function (mongoose) {
	
	var File = new mongoose.Schema({
		title	: String,
		name	: String,
		ext		: String,
		type	: String,
		size	: Number
	});
	
	var schema =
		{
			chatMessages : new mongoose.Schema({
				auteur 	: String,
				contenu : String,
				date 	: { type : Date, default : Date.now }
			}),
			
			users : new mongoose.Schema({
				login 		: String,
				passwd 		: String,
				_idJeux 	: [String],
				statut 		: Number,
				dateInsc	: Date,
				email		: String,
				url			: String,
				langage		: String,
				dev			: Number,
				photo		: [File],
				priority	: Number
			}),
			
			jeux : new mongoose.Schema({
				nbPlayer 		: {
					min : String,
					max : String
				},
				category 		: String,
				nom 			: String,
				description 	: String,
				titre			: String,
				color			: String
			}),
			
			categories : new mongoose.Schema({
				titre			: String
			})
		};
	
	
	return schema;
}