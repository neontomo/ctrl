/* TODO:
	* "I'm" replacer breaks if it's on a new line
	* Clean up CSS styling for rhymes box
	* Fix CSS styling for settings box
	* Placeholder JSON, put it in a file instead of a blobb
	* Make it so that only one folder can be open at a time
	* Search is too high up
	* Click to hide rhyme box
	* text manipulation is too much to the right compared to other toolbar items
*/

// Redirect to random ID if no ID chosen
if (!window.location.search.split(/[?|&]id=([^&]+)/)[1] || !window.location.search.split(/[?|&]id=([^&]+)/)[1].match(/^\[.+\]/)) { // If no title at all, or category missing
	window.location.href = '?id=[untitled]' + cleanString(new Mnemonic(32).toWords().join('_'));
}

populate();
getWrite();

// New Note
$('#newNoteButton').on('click', function () {
	var newNoteName = prompt('Note name:').trim();
	if (!newNoteName) return;

	var newNoteCategory = prompt('Category name:').trim();
	newNoteCategory = newNoteCategory ? newNoteCategory : 'untitled';

	newNote(newNoteCategory, newNoteName);
});

// Settings click
$('#settingsButton').on('click', function () {
	$(this).toggleClass('bold');
	$('#settings').toggleClass('active');
});

// Save settings values on input
$('#settings > input,#settings > select').on('input', function () {
	saveSetting($(this).attr('id'));
});

// Backup click
$('#backup').on('click', function () {
	var currentDate = new Date();
	var currentMonth = (('0' + (currentDate.getMonth()+1)).slice(-2));
	var currentTime = currentDate.toLocaleTimeString('en-GB', { hour: "numeric", minute: "numeric"}).replace(':', '.');
	var backupName = 'backup_' + [currentDate.getFullYear(), currentMonth, currentDate.getDate()].join('.') + '_' + currentTime + '.txt';
	download(backupName, backup());
});

// Restore click
$('#restoreBackup').on('click', function () {
	readFromFile();
});

// Download file click
$('#downloadNote').on('click', function () {
	downloadSelected();
});

// Delete note click
$('#deleteNote').on('click', function () {
	if (!confirm('Are you SURE you want to delete this file?')) return;
	deleteSelected();
	goTo('./');
});

// Rename note click
$('#renameNote').on('click', function () {
	if (!selectedTitle()) return;
	var answer = prompt('Rename', selectedTitle()[2].replace(/_/g, ' '));
	if (answer) {
		renameSelected(selectedTitle()[1], answer);
	}
});

// Change category click
$('#changeCategory').on('click', function () {
	if (!selectedTitle()) return;
	var answer = prompt('Change category', selectedTitle()[1].replace(/_/g, ' '));
	if (answer) {
		renameSelected(answer, selectedTitle()[2]);
	}
});

// Clear notes click
$('#clearNotes').on('click', function () {
	if (confirm('Are you SURE you want to delete everything?')) clearNotes();
});

// Save text while writing
$('#write').on('keyup', function () {
	saveWrite();
	$('#characterCount').attr('count', $('textarea').val().length);
	$('#wordCount').attr('count', ($('textarea').val().trim() ? $('textarea').val().match(/\S+/g).length : '0'));
});

// Settings

$('#fontsize').on('input', function () {
	changeCss('font-size', $(this).val(), '14', 'px');
});

$('#lineheight').on('input', function () {
	changeCss('line-height', $(this).val(), '23', 'px');
});

$('#font').on('input', function () {
	changeCss('font-family', $(this).val(), 'Roboto', '');
});

$('#searchInput').on('input', function () {
	var searchInput = $(this).val().trim();
	if (searchInput) {
		$('span[state="closed"]').attr('state', 'open');
	} else {
		$('span[state="open"]').attr('state', 'closed');
	}
	$('.item').hide();
	$('.item:icontains(' + searchInput + ')').css('display', 'block'); // has to use css
	localStorage.setItem('settings_control_searchInput', searchInput);
});

$('h1').click('on', function () {
	goTo('./');
});

// Focus textarea
$('textarea').focus().scrollTop(0);

// Update site <title>
$('title').html(selectedTitleFromURL()[2].replace(/_/g, ' '));

getSetting('fontsize', '14');
getSetting('lineheight', '23');
getSetting('font', 'Roboto');
getSetting('indentation', 'Tab');
addIndentation();

/*
$('#getRhyme').on('click', function (event) {
	$('#write').focus();
	checkRhymes();
	$('#contextMenu').hide();
});*/

$('#cutText').on('click', function (event) {
	var a = $('#write')[0].value.substring(0, cursorPosition()[0]);
	var b = $('#write')[0].value.substring(cursorPosition()[1], $('#write')[0].length);
	$('#write').focus();
	$('#write').val(a + b);
	$('#contextMenu').hide();
});

$('textarea').trigger('keyup');

if (selectedTitleFromURL()[2]) { // Otherwise the placeholder gets set twice because of a blank ID redirect if we click "Control"
	var quotes = JSON.parse(localStorage.getItem('control_[untitled]quotes'));
	var quote = quotes[Math.floor(Math.random() * quotes.length)];
	$('textarea').attr('placeholder', quote['text'] + '\n\n -' + quote['author']);
}

/*
$('#write')[0].addEventListener("contextmenu",function(e) {
	e.preventDefault();
	var ctxMenu = $('#contextMenu')[0];
	ctxMenu.style.display = "block";
	ctxMenu.style.left = (e.pageX - 10)+"px";
	ctxMenu.style.top = (e.pageY - 10)+"px";
},false);

$('#write').on('click', function() {
	$('#contextMenu').hide();
});
*/
