Hooks.on("init", function() {
  //console.log("== This code runs once the Foundry VTT software begins its initialization workflow.");


const version = game.version;  // e.g., "12.999"
const major = parseInt(version.split('.')[0]);  // 12
//console.log(`Major version: ${major}`);

// sheet and html are not really necessary. Not yet sure what the best way to do this is though.
if (major <= 12){
    Hooks.on("renderJournalSheet", (sheet, html, data) => {
        //console.log("==sheet 12:",sheet)
        //console.log("== html: 12",html[0])
        //console.log("== data: 12",data)
        sortButtonCreation(sheet,html[0])
    })
}
if (major >= 13){
    Hooks.on("renderJournalEntrySheet", (sheet, html, data) => {
        //console.log("==sheet: 13",sheet) 
        //console.log("== html: 13",html)
        //console.log("== data: 13",data)
        sortButtonCreation(sheet,html)
    })
};

});

/*
Hooks.on("ready", function() {
  console.log("== This code runs once core initialization is ready and game data is available.");
  console.log("== Existing registered Hook events",Hooks.events)
});
*/
/*
 Hooks.on("renderApplication", (app, html, data) => {
    console.log("== Something was rendered (renderApplication)");
    console.log(app)
    console.log(html)
  if (app.document?.type === "JournalEntry") {
    console.log("== Journal sheet rendered");
  }
});*/


// Render or Journal open/rendering function
function sortButtonCreation(sheet, html) {
    //console.log("== A journal was rendered (opened)");


    //get the container div holding the prev, add page and next button
    const container = html.querySelector("aside.journal-sidebar .action-buttons.flexrow");
    const containerTag = container.tagName 
    console.log("Container Tag is:",containerTag)
  
    // create the AZ button
    const buttonAZ = document.createElement('button');
    buttonAZ.className = 'sort-button';  // add own class for possible later styling
    buttonAZ.title = 'Sort A-Z';         // Native title for tooltip
    buttonAZ.innerHTML = '<i class="fa-regular fa-sort-alpha-down"></i>';  // A-Z font awesom icon/classes
    //add listener to the A-Z button
    buttonAZ.addEventListener('click', () => sortJournalPages(sheet,'asc'));


    // create the Z-A button
    const buttonZA = document.createElement('button');
    buttonZA.className = 'sort-button'; // add own class for possible later styling
    buttonZA.title = 'Sort Z-A'; // Native title for tooltip
    buttonZA.innerHTML = '<i class="fa-regular fa-sort-alpha-up-alt"></i>';  // Z-A font awesom icon/classes
    //add listener to the Z-A button
    buttonZA.addEventListener('click', () => sortJournalPages(sheet,'desc'));


    // create group div for new Buttons
    const newDiv = document.createElement('div');
    newDiv.classList.add('flexrow', 'sort-buttons');  // buttonS class added to div
    //adding buttons to new group div
    newDiv.appendChild(buttonAZ);
    newDiv.appendChild(buttonZA);

    //create group div which will hold the old buttons
    const buttonsDiv = document.createElement(containerTag);
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
    async function sortJournalPages(sheetFromHook,direction = 'asc') {
        const sheet = sheetFromHook //ui.activeWindow; // interaction should only be possible on an active window. But trickle down should make it safe
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

};

