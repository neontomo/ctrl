var websiteTitle = 'Ctrl';

jQuery.expr[':'].icontains = function(a, i, m) {
	return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

function selectedTitleFromURL() {
	var fullTitle = cleanString(window.location.search.split(/[?|&]id=([^&]+)/)[1]);
	var category	= fullTitle.replace(/\[(.+)\](.+)/, '$1');
	var title		= fullTitle.replace(/(\[.+\])(.+)/, '$2');
	return [fullTitle, category, title, ''];
}
function selectedTitle() {
	if ($('.item[selected=selected]').length == 0) {
		return selectedTitleFromURL();
	}
	var element		= $('.item[selected=selected]');
    var category	= element.attr('category');
	var title		= element.attr('title');
    var fullTitle	= '[' + category + ']' + title;
	var content		= localStorage.getItem("control_" + fullTitle);
    return [fullTitle, category, title, content];
}

function downloadSelected() {
	download(selectedTitle()[2].replace(/_/g, ' '), selectedTitle()[3]);
}

function deleteSelected() {
	deleteWrite('control_' + selectedTitle()[0]);
}

function renameSelected(category, newName) {
	if (!newName || (selectedTitle()[1] == category && selectedTitle()[2] == newName)) return;

	var newName = '[' + cleanString(category) + ']' + cleanString(newName);

	localStorage.setItem('control_' + newName, selectedTitle()[3]);
	deleteWrite('control_' + selectedTitle()[0]);

	goTo('./?id=' + newName);
}

function clearNotes() {
	var items = Object.entries(localStorage);

	for (var i = 0; i < items.length; i++) {
		if (items[i][0].match(/^control_/)) deleteWrite(items[i][0]);
	}
	goTo('./');
}

function readFromFile() {
	var input = document.createElement('input');
	input.type = 'file';
	input.onchange = e => {
		var file = e.target.files[0];
		var reader = new FileReader();
		reader.readAsText(file, 'UTF-8');
		reader.onload = readerEvent => {
			restoreBackup(readerEvent.target.result);
			window.location.reload();
		}
	}
	input.click();
}

function download(title, content){
	var text = content.replace(/\n/g, "\r\n");
	var blob = new Blob([text], {type: 'text/plain'});
	var anchor = document.createElement('a');
	anchor.download = title;
	anchor.href = window.URL.createObjectURL(blob);
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
}

function addIndentation () {
	$(document).delegate('textarea', 'keydown', function(e) { // Add tab indentation
		var type = ($('#indentation').val() == 'Tab') ? "\t" : $('#indentation').val();
		if (!type) var type = "\t";
		var keyCode = e.keyCode || e.which;
		if (keyCode == 9) {
			e.preventDefault();
			var start = this.selectionStart;
			$(this).val($(this).val().substring(0, start) + type + $(this).val().substring(this.selectionEnd));
			this.selectionEnd = start + type.length;
		}
	});
}

function goTo(url) {
	window.location.href = url;
}

function cleanString(string) {
	if (!string) return '';
	return decodeURIComponent(string.replace(/(%20)/g, ' ').trim().replace(/( )/g, '_').replace(/(\+)/g, '_').toLowerCase());
}

function newNote(newNoteCategory, newNoteName) {
	if (!newNoteCategory || !newNoteName) return;
	var title = '[' + cleanString(newNoteCategory) + ']' + cleanString(newNoteName);
	goTo('./?id=' + title);
}

function shortName(name) {
	if (name.length > 36) return name.substring(0, 36) + "...";
	return name;
}

function formatContent() {
    var cursor = cursorPosition();
	var format = $('#write').val()
	.replace(/(\n|^)(\*)/g, "$1\t•") // Bullet lists
	.replace(/(\n|^)([0-9]+)\./g, "$1\t$2\.") // Numbered lists
	.replace(/(\n|^)(\[X\])/gi, "$1◼")
	.replace(/(\n|^)(\[\])/gi, "$1◻")
	.replace(/->/g, '→')
	.replace(/<-/g, '←')
	.replace(/v-/g, '↓')
	.replace(/\^-/g, '↑');

	$('#write').val(format);

    refocusCursor(cursor[1]);
}

function saveWrite() {
	formatContent();

	if ($('#write').val().trim()) {
		localStorage.setItem('control_' + selectedTitle()[0], $('#write').val());
	} else {
		deleteWrite('control_' + selectedTitle()[0]);
	}
	populate();
}

function getWrite() {
	$('#write').val(localStorage.getItem('control_' + selectedTitle()[0]));
}

function deleteWrite(which) {
	localStorage.removeItem(which);
}

function getLocalStorage() {
	var itemsAll = Object.entries(localStorage);
	var items = [];

	for (var i = 0; i < itemsAll.length; i++) {
		if (itemsAll[i][0].match(/^control_/)) {
			items.push([itemsAll[i][0], itemsAll[i][1]]);
		}
	}
	return items.sort();
}

function populate() {
	$('#navigation .item, #navigation .category').remove();
	var items = getLocalStorage();
	for (var i = 0; i < items.length; i++) {
		var selectedTitle = cleanString(window.location.search.split(/[?|&]id=([^&]+)/)[1]);
		var fullTitle	= items[i][0].replace(/^control_/, '');
		var category	= fullTitle.replace(/\[(.+)\](.+)/, '$1');
		var title		= fullTitle.replace(/(\[.+\])(.+)/, '$2');
		var selected	= (fullTitle == selectedTitle) ? 'selected' : 'not-selected';

		var span = $('<a></a>');
		span[0].setAttribute('selected', selected);
		span[0].setAttribute('class', 'item');
		span[0].setAttribute('title', title);
		span[0].setAttribute('category', category);
		span[0].setAttribute('href', './?id=' + fullTitle);
		span[0].innerHTML = shortName(title.replace(/_/g, ' '));
		$('#navigation').append(span);
	}
	addCategories();
}

function getSetting(which, defaultVal) {
	var a = localStorage.getItem('settings_control_' + which);
	if ((a == "null" || !a) && $('#' + which).prop('nodeName') == 'SELECT') var a = defaultVal;
	$('#' + which).val(a).trigger('change').trigger('input');
}

function saveSetting(which) {
	localStorage.setItem('settings_control_' + which, $('#' + which).val());
}

function changeCss(style, thisVal, defaultVal, type) {
	if (!thisVal) var thisVal = defaultVal;
	$('textarea').css(style, thisVal + type);
}

function backup() {
	return JSON.stringify(getLocalStorage());
}

function restoreBackup(string) {
	var string = JSON.parse(JSON.parse(JSON.stringify(string)));
	for (var i = 0; i < string.length; i++) {
		localStorage.setItem(cleanString(string[i][0]), string[i][1]);
	}
}

function getCategories() {
	var categories = [];
	var items = $('.item');

	for (var i = 0; i < items.length; i++) {
		categories.push(items[i].getAttribute('category'));
	}
	return [ ...new Set(categories) ]; // Remove duplicates
}

function createCategoryElement(state, category) {
	var total = $('.item[category^="' + category + '"]').length;

	var newCategory = $('<span></span>');
	newCategory[0].setAttribute('state', state);
	newCategory[0].setAttribute('class', 'category');
	newCategory[0].setAttribute('title', category);

	var newLabel = $('<label></label>');
	newLabel[0].setAttribute('class', 'categoryName');
	newLabel[0].innerHTML = category.replace(/_/g, ' ') + ' <span class=total>' + total + '</span>';

	newCategory[0].appendChild(newLabel[0]);

	newLabel.on('click', function () {
		if ($('.category[state=open] .categoryName').length > 0) {
			var closeThis = $('.category[state=open] .categoryName')[0];
			if (closeThis.parentNode.getAttribute('title') !== this.parentNode.getAttribute('title')) { // Prevent double click
				closeThis.click();
			}
		}

		$(this).parent().attr('state', function (i, attr) {
			return attr == 'open' ? 'closed' : 'open'
		});

		var category = $(this).parent().attr('title');

		localStorage.setItem('settings_control_category[' + category + ']', $(this).parent().attr('state'));
	});

	$('#navigation').append(newCategory[0]);

	$('.item[category="' + category + '"]').appendTo(newCategory[0]); // Move all items into the category
}

function addCategories() {
	$('.category').remove();

	var categories = getCategories();

	for (var i = 0; i < categories.length; i++) {
		var state = (localStorage.getItem('settings_control_category[' + categories[i] + ']'));
		state = (state) ? (state) : 'open';

		createCategoryElement(state, categories[i]);
	}
}
/*
function checkRhymes() {
	var word = window.getSelection().toString().trim().replace(/\s/g, '+');
	if (word) {
		$.ajax({url: 'rhyme.php?w=' + word, dataType: 'text', async: true, success: function(data) {
			$('#rhymes').html('<span>RHYMES</span>' + data).show();
			if (!data) {
				$('#rhymes').hide();
			}
		}});
	}
}*/

function cursorPosition() {
	var write = $('#write')[0];
	var start = write.selectionStart;
	var end = write.selectionEnd;
	return [start, end];
}

function refocusCursor(cursorEnd) {
    $('textarea').focus();
    $('#write')[0].selectionEnd = cursorEnd;
}
