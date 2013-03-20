exports.modules = {
	loaded		: false,
	selected	: 'recettes',
	all			: {
		'recettes' 	: {
			title		: 'Recettes',
			categories  : {
				order		: ['recettes'],
				all			: {
					'recettes'	: {
						title		: 'Recettes',
						order		: [
							'recettes'
						]
					},
				}
			}
		},
		'private'	: {
			title		: 'Section private',
			categories  : {
				order		: ['private'],
				all			: {
					'private'	: {
						title		: 'Section private',
						order		: [
							'private'
						]
					},
				}
			}
		},
		'pense-betes'	: {
			title		: 'Pense-b&ecirc;tes',
			categories  : {
				order		: ['pense-betes'],
				all			: {
					'pense-betes'	: {
						title		: 'Pense-b&ecirc;tes',
						order		: ['licence', 'developpement', 'auto-entrepreneur', 'papiers', 'divers'],
					}
				}
			}
		},
		'emprunts' 		: {
			title		: 'Emprunts',
			categories  : {
				order		: ['emprunts', 'oeuvres'],
				all			: {
					'emprunts'	: {
						title		: 'Emprunts',
						order		: [
							'emprunts'
						]
					},
					'oeuvres'		: {
						title		: 'Oeuvres',
						order		: [
							'oeuvres',
							'categories'
						]
					}
				}
			}
		},
		'test' 		: {
			title		: 'Package-test',
			categories  : {
				order		: ['users'],
				all			: {
					'users'	: {
						title		: 'Utilisateurs',
						order		: [
							'users',
							'jeux'
						]
					}
				}
			}
		}
	}
};
