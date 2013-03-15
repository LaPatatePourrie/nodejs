this.statut = 4;

exports.load = function (param, callback) {
	var module = {
		name 			: 'recettes',
		title 			: 'Recettes',
		table 			: 'recettes',
		
		orderby 		: {
				field 		: 'titre',
				asc			: 1
		},
		
		
		fields 		 	: {
			order		: ['titre', 'ingredients', 'type', 'img', 'lien', 'commentaires', 'note'],
			all			: {
				titre		: {
					label 		: 'Titre',
					param		: {
						type 		: 'input'
					},
					constraints  : {
						notEmpty	: true
					}
				},
				lien		: {
					display			: { maxLength	: 20 },
					label 		: 'Lien',
					param		: {
						type 		: 'input',
						detail		: 'url'
					},
					constraints  : {
						url			: true
					}
				},
				ingredients		: {
					label 			: 'Ingr&eacute;dients',
					param			: {
						type 			: 'textarea'
					},
					constraints 	 : {
						notEmpty		: true
					}
				},
				commentaires	: {
					display			: { list : false, form : true },
					label 			: 'Commentaires',
					param			: {
						type 			: 'textarea'
					}
				},
				note	: {
					label 			: 'Note',
					param			: {
						type 			: 'radio',
						toggle			: {
							customize		: {
								'1'				: 'priority1',
								'2'				: 'priority2',
								'3'				: 'priority3',
								'4'				: 'priority4',
								'5'				: 'priority5'
							}
						},
						widget		: {
							switcher	: true
						},
						value 		: {
							fixed 		: true,
							values		: {
								'1'			: '1',
								'2'			: '2',
								'3'			: '3',
								'4'			: '4',
								'5'			: '5'
							}
						}
					}
				},
				type			: {
					display			: { maxSize	: 20 },
					label 			: 'Type',
					param			: {
						type 			: 'radio',
						widget			: { switcher : true },
						value			: {
							fixed			: true,
							values			: {
								'entree'		: 'Entr&eacute;e',
								'plat'			: 'Plat',
								'desser'		: 'Dessert'
							},
							dflt		: 'plat'
						}
					},
					constraints  : {
						notEmpty	: true
					}
				},
				img		: {
					label 		: 'Images',
					param		: {
						type 		: 'file',
						file		: {
							ext			: [
								'jpg', 'png', 'gif', 'bmp'
							],
							max			: 5,
							maxSize		: 10000000,
							statut		: 'pub',
							media		: 'img'
						}
					}
				}
			}
		},
		
		
		views	: {
			order	: ['entree', 'plat', 'dessert'],
			all		: {
				'entree'	: {
					title		: 'Entr&eacute;es',
					condition	: {
							type	: 'entree'
					}
				},
				'plat'	: {
					title		: 'Plats',
					condition	: {
							type	: 'plat'
					}
				},
				'dessert'	: {
					title		: 'Desserts',
					condition	: {
							type	: 'desser'
					}
				}
			}
		}
	};
	
	return module;
};
