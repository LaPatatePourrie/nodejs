this.statut = 4;

exports.load = function (param, callback) {
	var module = {
		name 			: 'jeux',
		title 			: 'Jeux',
		table 			: 'jeux',
		elempp			: 100,
		orderby 		: {
				field 		: 'titre',
				asc			: -1
		},
		
		restrict : {
			list	: 5
		},
		
		actions			: {
				add			: true,
				mod			: true,
				del			: true
		},
		
		
		fields 		 	: {
				order		: ['nom', 'titre', 'category', 'description', 'min', 'max', 'color'],
				all			: {
						nom		: {
								restrict		: 5,
								label 		: {
										list		: 'Nom',
										form		: 'Nom'
								},
								param		: {
										type 		: 'input'
								},
								display 	: {
										list 			: true,
										form			: true,
										maxLength		: 3
								}
						},
						titre		: {
								label 		: {
										list			: 'Titre',
										form			: 'Titre'
								},
								param		: {
										type 		: 'input'
								}
						},
						category	: {
								label 		: {
										list			: 'Cat&eacute;gorie'
								},
								param		: {
										type 		: 'input',
										autocomplete 	: true,
										value		: {
												embedded		: false,
												allowOther		: true,
												fixed			: false,
												dynamic 			: {
														table 		: 'categories',
														fields		: 'titre',
														order		: 'titre',
														separator	: ','
												}
										}
								}
						},
						min		: {
								parent		: 'nbPlayer',
								label 		: {
										list			: 'Min player',
										form			: 'Min player'
								},
								param		: {
										type 		: 'input'
								}
						},
						max		: {
								parent		: 'nbPlayer',
								label 		: {
										list			: 'Max Player',
										form			: 'Max Player'
								},
								param		: {
										type 		: 'input'
								}
						},
						description		: {
								param		: {
										type 		: 'textarea'
								},
								label 		: {
										list			: 'Description',
										form			: 'Description'
								}
						},
						color		: {
								label 		: {
										list			: 'Couleur',
										form			: 'Couleur'
								},
								param		: {
										type 		: 'input',
										widget		: {
											colorpicker		: {}
										}
								}
						}
				}
		}
	};
	
	return module;
};
