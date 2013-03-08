this.statut = 4;

exports.load = function (param, callback) {
	var module = {
		name 			: 'category',
		title 			: 'Cat&eacute;gorie',
		table 			: 'categories',
		
		orderby 		: {
				field 		: 'titre',
				asc			: 1
		},
		
		
		fields 		 	: {
				order		: ['titre'],
				all			: {
						titre		: {
								restrict		: false,
								label 		: {
										list		: 'Titre'
								},
								param		: {
										type 		: 'input'
								}
						}
				}
		}
	};
	
	return module;
};
