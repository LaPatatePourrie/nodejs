this.statut = 4;

exports.load = function (param, callback) {
	var module = {
		name 			: 'emprunts',
		title 			: 'Emprunts',
		table 			: 'emprunts',
		elempp			: 100,
		sort 		: {
				field 		: 'dateEmprunt',
				asc			: 1
		},
		
		actions			: {
				add			: true,
				mod			: true,
				del			: true
		},
		
		fields 			: {
				order		: ['_idOeuvre', 'emprunteur', 'dateEmprunt', 'rendu', 'dateRetour', 'urgence'],
				all			: {
						_idOeuvre		: {
								label 		: 'Emprunt',
								display 	: {
										list 		: true,
										form		: true
								},
								param		: {
										type 		: 'select',
										value		: {
												dynamic		: {
														'table'	 		: 'oeuvres',
														'fields'		: ['titre'],
														'sort'			: 'titre',
														'asc'			: '1'
												}
										}
								},
								constraints	: {
										notEmpty	: true
								}
						},
						emprunteur 		: {
								label 		: 'Emprunteur',
								display 	: true,
								param		: {
										type 		: 'input'
								},
								constraints	: {
										notEmpty	: true
								}
						},
						dateEmprunt : {
								label 		: 'Date de l\'emprunt',
								display 	: true,
								param		: {
										type 		: 'input',
										widget		: {
											date 		: true,
											options : {}
										}
								},
								constraints	: false
						},
						dateRetour: {
								label 		: 'Date de retour',
								display		: {
									list		: false,
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
						rendu	: {
								label 		: 'Rendu',
								display		: {
									list		: true,
									form		: true
								},
								param		: {
										type 			: 'radio',
										toggle			: {
											type			: 'forbidden'
										},
										widget			: {
											switcher	: true
										},
										value 		: {
											fixed 		: true,
											values		: {
												'0'			: 'Non',
												'1'			: 'Oui',
											}
										},
								},
								triggers		: [
									{ 
										values	: 1,
										fields	: 'dateRetour'
									}										
								]
						},
						urgence		: {
								label 		: 'Urgence',
								param		: {
										type 		: 'radio',
										toggle		: {
											customize	: {
												'1'			: 'priority1',
												'2'			: 'priority2',
												'3'			: 'priority3',
												'4'			: 'priority4',
												'5'			: 'priority5'
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
										},
										dflt		: [1]
								}
						}
				}
		}
	};
	
	return module;
};
