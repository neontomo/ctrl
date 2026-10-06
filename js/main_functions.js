const websiteTitle = "Ctrl";

jQuery.expr[":"].icontains = (a, _, m) =>
	jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;

function selectedTitleFromURL() {
	var fullTitle = cleanString(
		window.location.search.split(/[?|&]id=([^&]+)/)[1],
	);
	const category = fullTitle.replace(/\[(.+)\](.+)/, "$1");
	const title = fullTitle.replace(/(\[.+\])(.+)/, "$2");
	return [fullTitle, category, title, ""];
}
function selectedTitle() {
	if ($(".item[selected=selected]").length === 0) {
		return selectedTitleFromURL();
	}
	const element = $(".item[selected=selected]");
	const category = element.attr("category");
	const title = element.attr("title");
	const fullTitle = `[${category}]${title}`;
	const content = localStorage.getItem(`control_${fullTitle}`);
	return [fullTitle, category, title, content];
}

function downloadSelected() {
	download(selectedTitle()[2].replace(/_/g, " "), selectedTitle()[3]);
}

function deleteSelected() {
	deleteWrite(`control_${selectedTitle()[0]}`);
}

function renameSelected(category, newName) {
	if (
		!newName ||
		(selectedTitle()[1] === category && selectedTitle()[2] === newName)
	)
		return;

	newName = `[${cleanString(category)}]${cleanString(newName)}`;

	localStorage.setItem(`control_${newName}`, selectedTitle()[3]);
	deleteWrite(`control_${selectedTitle()[0]}`);

	goTo(`./?id=${newName}`);
}

function clearNotes() {
	const items = Object.entries(localStorage);

	for (let i = 0; i < items.length; i++) {
		if (items[i][0].match(/^control_/)) deleteWrite(items[i][0]);
	}
	goTo("./");
}

function readFromFile() {
	const input = document.createElement("input");
	input.type = "file";
	input.onchange = (e) => {
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.readAsText(file, "UTF-8");
		reader.onload = (readerEvent) => {
			restoreBackup(readerEvent.target.result);
			window.location.reload();
		};
	};
	input.click();
}

function download(title, content) {
	const text = content.replace(/\n/g, "\r\n");
	const blob = new Blob([text], { type: "text/plain" });
	const anchor = document.createElement("a");
	anchor.download = title;
	anchor.href = window.URL.createObjectURL(blob);
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
}

function addIndentation() {
	$(document).delegate("textarea", "keydown", function (e) {
		// Add tab indentation
		let type =
			$("#indentation").val() === "Tab" ? "\t" : $("#indentation").val();
		if (!type) type = "\t";

		const keyCode = e.keyCode || e.which;
		if (keyCode === 9) {
			e.preventDefault();
			const start = this.selectionStart;
			$(this).val(
				$(this).val().substring(0, start) +
					type +
					$(this).val().substring(this.selectionEnd),
			);
			this.selectionEnd = start + type.length;
		}
	});
}

function goTo(url) {
	window.location.href = url;
}

function cleanString(string) {
	if (!string) return "";
	return decodeURIComponent(
		string
			.replace(/(%20)/g, " ")
			.trim()
			.replace(/( )/g, "_")
			.replace(/(\+)/g, "_")
			.toLowerCase(),
	);
}

function newNote(newNoteCategory, newNoteName) {
	if (!newNoteCategory || !newNoteName) return;
	const title = `[${cleanString(newNoteCategory)}]${cleanString(newNoteName)}`;
	goTo(`./?id=${title}`);
}

function shortName(name) {
	if (name.length > 36) return `${name.substring(0, 36)}...`;
	return name;
}

function formatContent() {
	const cursor = cursorPosition();
	const format = $("#write")
		.val()
		.replace(/(\n|^)(\*)/g, "$1\t•") // Bullet lists
		.replace(/(\n|^)([0-9]+)\./g, "$1\t$2.") // Numbered lists
		.replace(/(\n|^)(\[X\])/gi, "$1◼")
		.replace(/(\n|^)(\[\])/gi, "$1◻")
		.replace(/->/g, "→")
		.replace(/<-/g, "←")
		.replace(/v-/g, "↓")
		.replace(/\^-/g, "↑");

	$("#write").val(format);

	refocusCursor(cursor[1]);
}

function saveWrite() {
	formatContent();

	if ($("#write").val().trim()) {
		localStorage.setItem(`control_${selectedTitle()[0]}`, $("#write").val());
	} else {
		deleteWrite(`control_${selectedTitle()[0]}`);
	}
	populate();
}

function getWrite() {
	$("#write").val(localStorage.getItem(`control_${selectedTitle()[0]}`));
}

function deleteWrite(which) {
	localStorage.removeItem(which);
}

function getLocalStorage() {
	const itemsAll = Object.entries(localStorage);
	const items = [];

	for (let i = 0; i < itemsAll.length; i++) {
		if (itemsAll[i][0].match(/^control_/)) {
			items.push([itemsAll[i][0], itemsAll[i][1]]);
		}
	}
	return items.sort();
}

function populate() {
	$("#navigation .item, #navigation .category").remove();
	const items = getLocalStorage();
	for (let i = 0; i < items.length; i++) {
		const selectedTitle = cleanString(
			window.location.search.split(/[?|&]id=([^&]+)/)[1],
		);
		const fullTitle = items[i][0].replace(/^control_/, "");
		const category = fullTitle.replace(/\[(.+)\](.+)/, "$1");
		const title = fullTitle.replace(/(\[.+\])(.+)/, "$2");
		const selected = fullTitle === selectedTitle ? "selected" : "not-selected";

		const span = $("<a></a>");
		span[0].setAttribute("selected", selected);
		span[0].setAttribute("class", "item");
		span[0].setAttribute("title", title);
		span[0].setAttribute("category", category);
		span[0].setAttribute("href", `./?id=${fullTitle}`);
		span[0].innerHTML = shortName(title.replace(/_/g, " "));
		$("#navigation").append(span);
	}
	addCategories();
}

function getSetting(which, defaultVal) {
	let a = localStorage.getItem(`settings_control_${which}`);
	if ((a === "null" || !a) && $(`#${which}`).prop("nodeName") === "SELECT")
		a = defaultVal;
	$(`#${which}`).val(a).trigger("change").trigger("input");
}

function saveSetting(which) {
	localStorage.setItem(`settings_control_${which}`, $(`#${which}`).val());
}

function changeCss(style, thisVal, defaultVal, type) {
	if (!thisVal) thisVal = defaultVal;
	$("textarea").css(style, thisVal + type);
}

function backup() {
	return JSON.stringify(getLocalStorage());
}

function restoreBackup(string) {
	string = JSON.parse(JSON.parse(JSON.stringify(string)));
	for (let i = 0; i < string.length; i++) {
		localStorage.setItem(cleanString(string[i][0]), string[i][1]);
	}
}

function getCategories() {
	const categories = [];
	const items = $(".item");

	for (let i = 0; i < items.length; i++) {
		categories.push(items[i].getAttribute("category"));
	}
	return [...new Set(categories)]; // Remove duplicates
}

function createCategoryElement(state, category) {
	const total = $(`.item[category^="${category}"]`).length;

	const newCategory = $("<span></span>");
	newCategory[0].setAttribute("state", state);
	newCategory[0].setAttribute("class", "category");
	newCategory[0].setAttribute("title", category);

	const newLabel = $("<label></label>");
	newLabel[0].setAttribute("class", "categoryName");
	newLabel[0].innerHTML = `${category.replace(/_/g, " ")} <span class=total>${total}</span>`;

	newCategory[0].appendChild(newLabel[0]);

	newLabel.on("click", function () {
		if ($(".category[state=open] .categoryName").length > 0) {
			const closeThis = $(".category[state=open] .categoryName")[0];
			if (
				closeThis.parentNode.getAttribute("title") !==
				this.parentNode.getAttribute("title")
			) {
				// Prevent double click
				closeThis.click();
			}
		}

		$(this)
			.parent()
			.attr("state", (_, attr) => (attr === "open" ? "closed" : "open"));

		const category = $(this).parent().attr("title");

		localStorage.setItem(
			`settings_control_category[${category}]`,
			$(this).parent().attr("state"),
		);
	});

	$("#navigation").append(newCategory[0]);

	$(`.item[category="${category}"]`).appendTo(newCategory[0]); // Move all items into the category
}

function addCategories() {
	$(".category").remove();

	const categories = getCategories();

	for (let i = 0; i < categories.length; i++) {
		let state = localStorage.getItem(
			`settings_control_category[${categories[i]}]`,
		);
		state = state ? state : "open";

		createCategoryElement(state, categories[i]);
	}
}

function cursorPosition() {
	const write = $("#write")[0];
	const start = write.selectionStart;
	const end = write.selectionEnd;
	return [start, end];
}

function refocusCursor(cursorEnd) {
	$("textarea").focus();
	$("#write")[0].selectionEnd = cursorEnd;
}
