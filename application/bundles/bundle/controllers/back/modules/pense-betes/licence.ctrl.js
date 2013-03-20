this.statut = 4;

exports.load = function (param, callback) {
	var module = {
		name 			: 'licence',
		title 			: 'Licence',
		table 			: 'licence',
		
		orderby 		: {
				field 		: 'titre',
				asc			: 1
		},
		
		
		fields 		 	: {
			order		: ['titre', 'date', 'description', 'urgence', 'fichiers'],
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
				description	: {
					display		: { list : false, form : true },
					label 		: 'Description',
					param		: {
						type 		: 'textarea',
						widget		: {
							wysiwyg		: 'ckeditor'
						}
					}
				},
				date	: {
					display		: true,
					label 		: 'Date',
					param		: {
						type 		: 'input',
						widget		: {
							date		: true
						}
					}
				},
				urgence	: {
					label 			: 'Urgence',
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
				fichiers		: {
					label 		: 'Fichiers',
					param		: {
						type 		: 'file',
						file		: {
							max			: 10,
							maxSize		: 10000000,
							statut		: 'priv',
							media		: 'file'
						}
					}
				}
			}
		}
	};
	
	return module;
};
