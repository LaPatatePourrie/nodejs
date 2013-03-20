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
				order		: ['titre', 'fichiers'],
				all			: {
						titre		: {
								restrict		: false,
								label 		: {
										list		: 'Titre'
								},
								param		: {
										type 		: 'input'
								}
						},
						fichiers		: {
								display 	: true,
								param		: {
										type 		: 'file',
										file		: {
												ext			: [
													'mp4', 'mpg', 'mp3'
												],
												max			: 5,
												maxSize		: 10000000,
												statut		: 'private',
												media		: 'video'
										}
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
