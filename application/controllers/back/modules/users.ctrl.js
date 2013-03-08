this.statut = 4;

exports.load = function (param, callback) {
	var module = {
		name 			: 'users',
		title 			: 'Utilisateurs',
		table 			: 'users',
		elempp			: 100,
		sort 		: {
				field 		: 'login',
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
				order		: ['statut', 'login', 'photo', '_idJeux', 'dateInsc', 'email', 'priority', 'dev', 'url', 'passwd', 'langage'],
				all			: {
						login		: {
								display 	: {
										list 		: true,
										form		: true
								},
								param		: {
										type 			: 'input',
										dflt			: 'Anonym'
								}
						},
						email		: {
								display 	: true,
								param		: {
										type 			: 'input',
										placeholder 	: 'alexiserres@hotmail.com',
										detail			: 'email'
								},
								constraints	: {
										email		: true
								}
						},
						url		: {
								label 		: 'Site web',
								display		: {
									list		: true,
									form		: true,
									maxLength	: 10
								},
								param		: {
										type 			: 'input',
										detail			: 'url'
								},
								constraints	: {
										url			: true,
										notEmpty	: true,
										longerThan	: 10
								}
						},
						langage : {
								display 	: {
										list	: false,
										form	: true
								},
								param		: {
										type 			: 'input',
										detail			: 'tel',
										dflt			: 'Aucun',
										autocomplete 	: true,
										value		: {
												fixed 			: true,
												embedded		: true,
												allowOther		: true,
												values			: {
														'C'				: 'C',
														'C++'			: 'C++',
														'C#'			: 'C#',
														'PHP'			: 'PHP',
														'JavaScript'	: 'JavaScript',
														'JAVA'			: 'JAVA',
														'Kobol'			: 'Kobol',
														'Python'		: 'Python',
														'Ruby'			: 'Ruby',
														'.NET'			: '.net',
														'SQL'			: 'SQL',
												}
										}
								}
						},
						dateInsc		: {
								label 		: {
										list		: 'Date d\'inscription',
										form		: 'Date d\'inscription'
								},
								details 		: 'Date d\'inscription',
								display 	: {
										list 		: true,
										form		: true
								},
								param		: {
										type 		: 'input',
										widget		: {
											date 		: true,
											options : {}
										},
										dflt		: 'now'
								},
								constraints			: {
										notEmpty		: true
								}
						},
						statut		: {
								label 		: {
										list		: 'Statut',
										form		: 'Statut'
								},
								details 		: 'Le statut de l\'utilisateur',
								display 	: {
										list 		: true,
										form		: true
								},
								param		: {
										type 		: 'radio',
										widget		: {
											switcher	: true
										},
										value		: {
												fixed 		: true,
												values		: {
														1 		: 'Root',
														2		: 'Super admin',
														3		: 'Admin',
														4		: 'Utilisateur',
														5		: 'Visiteur'
												},
												deflt : 5
										}
								},
								constraints			: {
										notEmpty		: true
								}
						},
						_idJeux		: {
								label 		: {
										list		: 'Jeux',
										form		: 'Jeux'
								},
								display 	: {
										list 		: true,
										form		: true
								},
								param		: {
										type 		: 'checkbox',
										value		: {
												fixed 		: false,
												dynamic		: {
														'table'	 		: 'jeux',
														'fields'		: ['titre'],
														'separator'		: 'ou',
														'sort'			: 'titre',
														'asc'			: '1'
												}
										}
								},
								constraints	: {
										// notEmpty	: false
								}
						},
						passwd		: {
								label 		: {
										list		: 'Mot de passe',
										form			: 'Mot de passe'
								},
								display 	: {
										list 		: false,
										form		: true
								},
								param		: {
										type 		: 'passwd'
								},
								constraints : {
										longerThan	: 5
								}
						},
						dev			: {
								label 		: 'D&eacute;veloppeur',
								param		: {
										type 		: 'radio',
										toggle		: {
											type		: 'forbidden'
										},
										widget		: {
											switcher	: true
										},
										value 		: {
											fixed 		: true,
											values		: {
												'1'			: 'Oui',
												'0'			: 'Non'
											}
										},
										dflt		: [0]
								},
								triggers		: [
									{ 
										values  : 1,
										fields	: 'url'
									}
								]
						},
						priority	: {
								label 		: 'Priorit&eacute;',
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
										dflt		: [3]
								}
						},
						photo		: {
								display 	: true,
								param		: {
										type 		: 'file',
										file		: {
												ext			: [
													'jpg', 'png', 'rar', 'mp4', 'mpg', 'mp3'
												],
												max			: 5,
												maxSize		: 100000,
												extend		: true,
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
				order		: ['admin', 'members'],
				all			: {
						admin		: {
								title		: 'Administrateurs',
								order	 	: ['statut', 'login', '_idJeux'],
								restrict 	: {
										actions		: {
											list	: 5,
											add		: 5,
											mod		: 5,
											del		: 1,
										}
								},
								condition	: {
										statut	 	: {
												$lt		: 4
										}
								},
								sort		: {
										field		: 'langage',
										asc			: 1
								}
						},
						members		: {
								title		: 'Membres',
								order	 	: ['statut', 'login', '_idJeux'],
								condition	: {
										statut	 	: 4
								},
								sort		: {
										field		: 'login',
										asc			: 1
								}
						}
				}
		}
	};
	
	return module;
};
