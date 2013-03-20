this.statut = 4;

exports.load = function (param, callback) {
	var module = {
		name 			: 'oeuvres',
		title 			: 'Oeuvres',
		table 			: 'oeuvres',
		elempp			: 100,
		sort 		: {
				field 		: 'login',
				asc			: 1
		},
		
		restrict : {
			actions		: {
				list	: 5
			}
		},
		
		actions			: {
				add			: true,
				mod			: true,
				del			: true
		},
		
		fields 			: {
				order		: ['titre', 'type', '_idCategorie', 'realisateur', 'acteurs', 'auteur', 'dateParution', 'img', 'description'],
				all			: {
						titre		: {
								label 		: 'Titre',
								display 	: {
										list 		: true,
										form		: true
								},
								param		: {
										type 			: 'input'
								},
								constraints	: {
										notEmpty	: true
								}
						},
						type 		: {
								label 		: 'Type d\'oeuvre',
								display 	: true,
								param		: {
										type 		: 'radio',
										value		: {
												fixed	: true,
												values	: {
													'film'		: 'Film',
													'livre'		: 'Livre',
													'bd'		: 'BD'
												}
										}
								},
								constraints	: {
										notEmpty	: true
								},
								triggers		: [
									{ 
										values  : 'film',
										fields	: ['realisateur', 'acteurs']
									},
									{ 
										values  : 'livre',
										fields	: ['auteur']
									}
								]
						},
						_idCategorie : {
								label 		: 'Cat&eacute;gorie',
								display 	: true,
								param		: {
										type 		: 'radio',
										value		: {
												dynamic		: {
														'table'	 		: 'categories',
														'fields'		: ['nom'],
														'sort'			: 'nom',
														'asc'			: '1'
												}
										}
								},
								constraints	: false
						},
						dateParution: {
								label 		: 'Date de parution',
								display		: {
									list		: true,
									form		: true
								},
								param		: {
										type 		: 'input',
										widget		: {
											date 		: true,
											options : {}
										}
								}
						},
						realisateur	: {
								label 		: 'R&eacute;alisateur',
								display		: {
									list		: false,
									form		: true
								},
								param		: {
										type 			: 'input'
								}
						},
						auteur		: {
								label 		: 'Auteur',
								display		: {
									list		: false,
									form		: true
								},
								param		: {
										type 			: 'input'
								}
						},
						acteurs : {
								display 	: {
										list	: false,
										form	: true
								},
								param		: {
										type 			: 'textarea'
								}
						},
						description	: {
								label 		: 'Description',
								display 	: {
										list 		: false,
										form		: true
								},
								param		: {
										type 		: 'textarea',
										widget		: {
											wysiwyg		: 'ckeditor',
											options		: {}
										}
								}
						},
						img	: {
								display 	: true,
								param		: {
										type 		: 'file',
										file		: {
												ext			: [
													'jpg', 'png'
												],
												max			: 5,
												maxSize		: 100000,
												statut		: 'public',
												media		: 'img'
										}
								},
								constraints  : {
									notEmpty	: false
								}
						}
				}
		},
		
		
		
		views : {
				order		: ['films', 'livres'],
				all			: {
						films		: {
								title		: 'Films',
								order	 	: ['titre', '_idCategorie', 'dateParution', 'realisateur', 'acteurs', 'description', 'img'],
								condition	: {
										type 	: 'film'
								},
								sort		: {
										field		: 'titre',
										asc			: 1
								}
						},
						livres		: {
								title		: 'Livres',
								order	 	: ['titre', '_idCategorie', 'dateParution', 'auteur', 'description', 'img'],
								condition	: {
										type 	: 'livre'
								},
								sort		: {
										field		: 'titre',
										asc			: 1
								}
						}
				}
		}
	};
	
	return module;
};
