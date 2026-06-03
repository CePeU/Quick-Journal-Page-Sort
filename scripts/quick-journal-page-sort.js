//Quick-Journal-Page-Sort
//CONFIG.debug.hooks = true
let pageHistory = null;

Hooks.on("init", function () {
    

    const version = game.version;  // e.g., "12.999"
    const major = parseInt(version.split('.')[0]);  // 12 or 13

    // sheet and html are passed down to the following functions making sure the html of the respective button is changed
    if (major <= 12) {
        Hooks.on("renderJournalSheet", (sheet, html, data) => {
            //console.log("==sheet 12:",sheet)
            //console.log("== html: 12",html[0])
            console.log("== data: 12",data)
            let qjpsButtonExists = html[0].querySelector("aside.journal-sidebar .qjps") ?? false;
            //console.log("Found what?: ",qjpsButtonExists)
            if (qjpsButtonExists) return;
            sortButtonCreation(sheet, html[0])
        })
    }
    if (major >= 13) {
        Hooks.on("renderJournalEntrySheet", (sheet, html, data) => {
            //console.log("==sheet: 13",sheet) 
            //console.log("== html: 13",html)
            console.log("QJPS: == data: 13",data)
            const qjpsButtonExists = html.querySelector("aside.journal-sidebar .qjps") ?? false;
            console.log("QJPS: Found what?: ",qjpsButtonExists)
            if (qjpsButtonExists) return;
            sortButtonCreation(sheet, html)
        })
    };

    // Register settings
    game.settings.register("quick-journal-page-sort", "qjpsFontSize", {
    name: game.i18n.localize("QJPS.settings.qjpsFontSize.name"),
    hint: game.i18n.localize("QJPS.settings.qjpsFontSize.hint"),
    scope: "client",
    config: true,
    type: Number,
    default: 18,
    range: { min: 8, max: 32, step:1 }
    });

    const fontSize = game.settings.get("quick-journal-page-sort", "qjpsFontSize");
    document.documentElement.style.setProperty("--qjps-font-size", `${fontSize}px`)

    console.log("QJPS: Quick-Journal-Page-Sort has been initialized");
});


// Render or Journal open/rendering function
function sortButtonCreation(sheet, html) {
    //console.log("== A journal was rendered (opened)");


    //get the container div holding the prev, add page and next button
    const container = html.querySelector("aside.journal-sidebar .action-buttons.flexrow");
    const containerTag = container.tagName
    console.log("QJPS: Container Tag is:",containerTag)

    // create the AZ button
    const buttonAZ = document.createElement('button');
    buttonAZ.className = 'qjp-sort-AZ';  // add own class for possible later styling
    buttonAZ.title = game.i18n.localize("QJPS.SortAZ");         // Native title for tooltip
    buttonAZ.innerHTML = '<i class="fa-regular fa-sort-alpha-down"></i>';  // A-Z font awesom icon/classes
    //add listener to the A-Z button
    buttonAZ.addEventListener('click', () => sortJournalPages(sheet, 'asc'));


    // create the Z-A button
    const buttonZA = document.createElement('button');
    buttonZA.className = 'qjp-sort-ZA'; // add own class for possible later styling
    buttonZA.title = game.i18n.localize("QJPS.SortZA"); // Native title for tooltip
    buttonZA.innerHTML = '<i class="fa-regular fa-sort-alpha-up-alt"></i>';  // Z-A font awesom icon/classes
    //add listener to the Z-A button
    buttonZA.addEventListener('click', () => sortJournalPages(sheet, 'desc'));

    console.log("QJPS: ZA Button: ",buttonZA)

    let qjpContainer = html.querySelector(".qjp-buttons") ?? false;

    console.log("QJPS: qipContainer ",qjpContainer);
    if (qjpContainer) {
        console.log("QJPS: BACK war zuerst da")
console.log("QJPS: Normal Tree Choice 1")
    qjpContainer.classList.add('qjps');
    const targetButtonForward = html.querySelector(".qjp-buttons .qjp-forward");
     
    if (targetButtonForward) {
    // AZ Button nach dem Forward-Button
        targetButtonForward.insertAdjacentElement("afterend", buttonAZ);
    }
    const targetButtonBack = html.querySelector(".qjp-buttons .qjp-back");
    if (targetButtonBack) {
    // ZA Button vor dem Back-Button
        targetButtonBack.insertAdjacentElement("beforebegin", buttonZA);
    }
    
    } else {
    // create group div for new Buttons
    console.log("QJPS: Else Tree reached")
    const newDiv = document.createElement('div');
    newDiv.classList.add('flexrow', 'qjp-buttons','qjps');  // buttonS class added to div
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
    console.log("QJPS: Container before append child: ",container);
    console.log("QJPS: newDiv before append child: ",newDiv);
    console.log("QJPS: newDiv before append child: ",buttonsDiv);
    
    container.appendChild(newDiv);
    container.appendChild(buttonsDiv);
    //remove the class flexrow from the previous container but keep action-buttons as it styles the container to be on the bottom of the pane
    container.classList.remove('flexrow');
    console.log("QJPS: Conatiner element: ", container)
    }

    // sorting function
    async function sortJournalPages(sheetFromHook, direction = 'asc') {
        const sheet = sheetFromHook //ui.activeWindow; // interaction should only be possible on an active window. But trickle down should make it safe
        if (!sheet || sheet.document.documentName !== "JournalEntry" || !sheet.rendered) {
            ui.notifications.warn(game.i18n.localize("QJPS.WarnNoJournal"));
            return false;
        }

        const journal = sheet.document;
        const pages = journal.pages.contents;
        if (!pages.length) {
            ui.notifications.info(game.i18n.localize("QJPS.InfoNoPages"));
            return false;
        }

        // Sort based on direction
        const sorted = [...pages].sort((a, b) => {
            if (direction === 'desc') {
                return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: "base" });
            }
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
        });

        const updates = sorted.map((page, index) => ({ _id: page.id, sort: (index + 1) * 1000 }));
        await journal.updateEmbeddedDocuments("JournalEntryPage", updates);
        sheet.render(true);
        return true;
    }

};
