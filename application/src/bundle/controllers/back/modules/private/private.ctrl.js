this.statut = 4;

exports.load = function (param, callback) {
	var module = {
		name 		: 'private',
		title 		: 'Section private',
		table 		: 'priv',
		
		orderby 	: {
				field 	: 'titre',
				asc		: 1
		},
		
		restrict : {
			actions	: {
				list	: 1
			}
		},
		
		fields 		: {
			order		: ['titre'],
			all			: {
				titre		: {
					label 		: 'Titre',
					param		: {
						type 		: 'input'
					},
					constraints  : {
						notEmpty	: true
					}
				}
			}
		}
	};
	
	return module;
};
