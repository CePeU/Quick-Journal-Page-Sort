// Render or Journal open/rendering function
Hooks.on("renderJournalSheet", (sheet, html, data) => {
    //console.log("A journal was rendered (opened)");
    //console.log(sheet)
    //console.log(html)

    //get the container div holding the prev, add page and next button
    const container = document.querySelector("aside.journal-sidebar div.action-buttons.flexrow");

    // create the AZ button
    const buttonAZ = document.createElement('button');
    buttonAZ.className = 'sort-button';  // add own class for possible later styling
    buttonAZ.title = 'Sort A-Z';         // Native title for tooltip
    buttonAZ.innerHTML = '<i class="fa-regular fa-sort-alpha-down"></i>';  // A-Z font awesom icon/classes
    //add listener to the A-Z button
    buttonAZ.addEventListener('click', () => sortJournalPages('asc'));


    // create the Z-A button
    const buttonZA = document.createElement('button');
    buttonZA.className = 'sort-button'; // add own class for possible later styling
    buttonZA.title = 'Sort Z-A'; // Native title for tooltip
    buttonZA.innerHTML = '<i class="fa-regular fa-sort-alpha-up-alt"></i>';  // Z-A font awesom icon/classes
    //add listener to the Z-A button
    buttonZA.addEventListener('click', () => sortJournalPages('desc'));


    // create group div for new Buttons
    const newDiv = document.createElement('div');
    newDiv.classList.add('flexrow', 'sort-buttons');  // buttonS class added to div
    //adding buttons to new group div
    newDiv.appendChild(buttonAZ);
    newDiv.appendChild(buttonZA);

    //create group div which will hold the old buttons
    const buttonsDiv = document.createElement('div');
    // give the new group the old styling classed of the old group
    buttonsDiv.classList.add('action-buttons', 'flexrow');
    //move the old buttons into the new div
    //DOM nodes can only exist in one place in the document at a time. When appendChild() moves a node, 
    //it automatically removes it from its previous parent.
    while (container.firstChild) {
        buttonsDiv.appendChild(container.firstChild);
    }

    //add both divs for new and old buttons to previous container
    container.appendChild(newDiv);
    container.appendChild(buttonsDiv);
    //remove the class flexrow from the previous container but keem action-buttons as it styles the container to be on the bottom of the pane
    container.classList.remove('flexrow');

    // sorting function
    async function sortJournalPages(direction = 'asc') {
        const sheet = ui.activeWindow;
        if (!sheet || sheet.document.documentName !== "JournalEntry" || !sheet.rendered) {
            ui.notifications.warn("No journal is currently open.");
            return false;
        }

        const journal = sheet.document;
        const pages = journal.pages.contents;
        if (!pages.length) {
            ui.notifications.info("The open journal contains no pages.");
            return false;
        }

        // Sort based on direction
        const sorted = [...pages].sort((a, b) => {
            if (direction === 'desc') {
                return b.name.localeCompare(a.name, undefined, { sensitivity: "base" });
            }
            return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        });

        const updates = sorted.map((page, index) => ({ _id: page.id, sort: (index + 1) * 10 }));
        await journal.updateEmbeddedDocuments("JournalEntryPage", updates);
        sheet.render(true);
        return true;
    }

});

