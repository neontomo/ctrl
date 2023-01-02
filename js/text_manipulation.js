function uppercaseIm() {
    var cursor = cursorPosition();
	var text = $('textarea').val().replace(/i\'m/g, 'I\'m')
	.replace(/\si\s/g, ' I ')
	.replace(/i\'ll/g, 'I\'ll')
	.replace(/i\'ve/g, 'I\'ve')
	.replace(/i\'d/g, 'I\'d');
	$('textarea').val(text);
	$('textarea').trigger('keyup');
    
    refocusCursor(cursor[1]);
}

$('#uppercaseIm').on('click', function () {
	uppercaseIm();
});

function uppercaseFirst() {
    var cursor = cursorPosition();
	var text = $('textarea').val().replace(/(\n(.)|^(.)|(\.(\s|).))/g, function(letter) {
		return letter.toUpperCase();
	});
	$('textarea').val(text);
    $('textarea').trigger('keyup');
    
    refocusCursor(cursor[1]);
}

$('#uppercaseFirst').on('click', function () {
	uppercaseFirst();
});

function uppercaseAll() {
    var cursor = cursorPosition();
	$('textarea').val($('textarea').val().toUpperCase());
    $('textarea').trigger('keyup');

    refocusCursor(cursor[1]);
}

$('#uppercaseAll').on('mouseup', function () {
    uppercaseAll();
});

function lowercaseFirst() {
    var cursor = cursorPosition();
	$('textarea').val($('textarea').val().replace(/(\n(.)|^(.)|(\.(\s|).))/g, function(letter) {
		return letter.toLowerCase();
	}));
	$('textarea').trigger('keyup');
    
    refocusCursor(cursor[1]);
}

$('#lowercaseFirst').on('click', function () {
	lowercaseFirst();
});

function lowercaseAll() {
    var cursor = cursorPosition();
	$('textarea').val($('textarea').val().toLowerCase());
	$('textarea').trigger('keyup');
    
    refocusCursor(cursor[1]);
}

$('#lowercaseAll').on('click', function () {
	lowercaseAll();
});

function replaceString() {
    var cursor = cursorPosition();
	var caseInsensitive = $('#replaceStringCheckbox').is(':checked') ? 'gi' : 'g';
	var from = $('#replaceStringFrom').val();
	var to = $('#replaceStringTo').val();
	var re = new RegExp(from, caseInsensitive);

	$('textarea').val($('textarea').val().replace(re, to));
	$('textarea').trigger('keyup');
    
    refocusCursor(cursor[1]);
}

$('#replacer').on('click', function () {
	$('#replaceString').show();
});

$('#replaceStringReplace').on('click', function () {
	replaceString();
	$('textarea').trigger('keyup');
});

$('#replaceStringCancel').on('click', function () {
	$('#replaceString').hide();
});

$(document).on('keydown', function ( e ) { // CTRL + H to replace text
	if ((e.metaKey || e.ctrlKey) && ( String.fromCharCode(e.which).toLowerCase() === 'h') ) {
		e.preventDefault();
		$('#replaceString').show();
	}
});
