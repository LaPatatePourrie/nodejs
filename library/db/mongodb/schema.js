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
			
			// Test
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
				titre			: String,
				fichiers		: [File]
			}),
			
			
			// Emprunts
			oeuvre_categories : new mongoose.Schema({
				nom			: String
			}),
			
			oeuvres : new mongoose.Schema({
				titre			: String,
				auteur			: String,
				realisateurs	: String,
				acteurs			: String,
				_idCategorie	: String,
				dateParution	: Date,
				type			: String,
				img				: [File],
				description		: String
			}),
			
			emprunts : new mongoose.Schema({
				_idOeuvre	: String,
				emprunteur	: String,
				dateEmprunt	: Date,
				dateRetour	: Date,
				rendu		: Number,
				urgence		: Number,
			})
		};
	
	
	return schema;
}