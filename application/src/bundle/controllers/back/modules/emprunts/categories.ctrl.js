this.statut = 4;

exports.load = function (param, callback) {
	var module = {
		name 			: 'oeuvre_categories',
		title 			: 'Cat&eacute;gories',
		table 			: 'oeuvre_categories',
		elempp			: 100,
		sort 		: {
				field 		: 'nom',
				asc			: 1
		},
		
		restrict : {
			actions		: {
				list	: 5
			}
			/*,
			datas 		: [
					{ 
						restricted 	: 4,
						condition	: { statut : {$gt : 3}}
					},
					{
						restricted 	: 3,
						condition	: { statut : {$gt : 2}}
					}
			]*/
		},
		
		actions			: {
				add			: true,
				mod			: true,
				del			: true
		},
		
		fields 			: {
				order		: ['nom'],
				all			: {
						nom		: {
								display 	: true,
								param		: {
										type 			: 'input'
								},
								constraints	: {
									notEmpty	: true
								}
						}
				}
		}
	};
	
	return module;
};
