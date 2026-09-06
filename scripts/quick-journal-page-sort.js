//Quick-Journal-Page-Sort
//CONFIG.debug.hooks = true
const MODULE_ID = "quick-journal-page-sort";

let socket = null;

Hooks.once("socketlib.ready", () => {
    socket = socketlib.registerModule(MODULE_ID);
    if (!socket) {
        console.error(`${MODULE_ID} | Socket registration failed. Check the manifest and restart the world.`);
        return;
    }
    socket.register("socketLibSortJournalPages", socketLibSortJournalPages);
});

// socketlib supplies the requesting user's ID through this.socketdata.
// Resolve documents on the GM client; sheets cannot be sent over a socket.
async function socketLibSortJournalPages(journalId, direction) {
    if (!game.user.isGM) throw new Error("Sorting must execute on a GM client.");
    if (typeof journalId !== "string" || !["asc", "desc"].includes(direction)) {
        throw new Error("Invalid sort request.");
    }
    const requester = game.users.get(this.socketdata?.userId);
    const journal = game.journal.get(journalId);
    if (!requester || !journal) throw new Error("Invalid journal or requesting user.");

    // A requester must have access to at least one page in this journal.
    if (!journal.pages.contents.some(page => page.testUserPermission(requester, "LIMITED"))) {
        return false;
    }
    const sorted = sortPagesByName(journal.pages.contents, direction);
    const updates = sorted.map((page, index) => ({ _id: page.id, sort: (index + 1) * 1000 }));
    await journal.updateEmbeddedDocuments("JournalEntryPage", updates);
    return true;
}

function sortPagesByName(pages, direction) {
    if (!["asc", "desc"].includes(direction)) throw new Error("Invalid sort direction.");
    return [...pages].sort((a, b) => {
        const comparison = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
        return direction === "desc" ? -comparison : comparison;
    });
}

async function sortOwnedJournalPages(journal, direction) {
    const pages = journal.pages.contents;
    const sorted = sortPagesByName(pages.filter(page => page.isOwner), direction);
    if (!sorted.length) return false;

    const lowestSort = Math.min(...pages.map(page => page.sort));
    const highestSort = Math.max(...pages.map(page => page.sort));
    // Distribute owned pages evenly between zero and the current lowest key.
    // If that interval is full (or already negative), append in steps of 20.
    const step = Math.floor(lowestSort / (sorted.length + 1));
    const updates = sorted.map((page, index) => ({
        _id: page.id,
        sort: step >= 1 ? (index + 1) * step : highestSort + (index + 1) * 20
    }));
    if (updates.some(update => !Number.isSafeInteger(update.sort))) {
        throw new Error("No safe integer sort range remains for these pages.");
    }
    await journal.updateEmbeddedDocuments("JournalEntryPage", updates);
    return true;
}

async function requestJournalSort(sheet, direction) {
    const journal = sheet.document ?? sheet.object;
    if (journal?.documentName !== "JournalEntry" || !sheet.rendered) {
        ui.notifications.warn(game.i18n.localize("QJPS.WarnNoJournal"));
        return;
    }
    try {
        let changed;
        if (!game.user.isGM && !game.users.activeGM) {
            changed = await sortOwnedJournalPages(journal, direction);
        } else {
            if (!socket) {
                ui.notifications.error(game.i18n.localize("QJPS.ErrorSocketNotReady"));
                return;
            }
            changed = await socket.executeAsGM("socketLibSortJournalPages", journal.id, direction);
        }
        if (!changed) ui.notifications.info(game.i18n.localize("QJPS.InfoNoPages"));
        else sheet.render(true);
    } catch (error) {
        console.error(`${MODULE_ID} | Journal sorting failed`, error);
        ui.notifications.error(game.i18n.localize("QJPS.ErrorSortFailed"));
    }
}

Hooks.on("ready", function () {

    const version = game.version;  // e.g., "12.999"
    const major = parseInt(version.split('.')[0]);  // 12 or 13

    // sheet and html are passed down to the following functions making sure the html of the respective button is changed
    if (major <= 12) {
        Hooks.on("renderJournalSheet", (sheet, html, data) => {
            //console.log("==sheet 12:",sheet)
            //console.log("== html: 12",html[0])
            //console.log("== data: 12",data)
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
            //console.log("QJPS: == data: 13",data)
            const qjpsButtonExists = html.querySelector("aside.journal-sidebar .qjps") ?? false;
            //console.log("QJPS: Found what?: ",qjpsButtonExists)
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
        range: { min: 8, max: 32, step: 1 }
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
    if (!container) return;
    const containerTag = container.tagName
    //console.log("QJPS: Container Tag is:",containerTag)

    // create the AZ button
    const buttonAZ = document.createElement('button');
    buttonAZ.className = 'qjp-sort-AZ';  // add own class for possible later styling
    buttonAZ.title = game.i18n.localize("QJPS.SortAZ");         // Native title for tooltip
    buttonAZ.innerHTML = '<i class="fa-regular fa-sort-alpha-down"></i>';  // A-Z font awesom icon/classes
    //add listener to the A-Z button
    buttonAZ.type = "button";
    buttonAZ.addEventListener('click', () => requestJournalSort(sheet, 'asc'));

    // create the Z-A button
    const buttonZA = document.createElement('button');
    buttonZA.className = 'qjp-sort-ZA'; // add own class for possible later styling
    buttonZA.title = game.i18n.localize("QJPS.SortZA"); // Native title for tooltip
    buttonZA.innerHTML = '<i class="fa-regular fa-sort-alpha-up-alt"></i>';  // Z-A font awesom icon/classes
    //add listener to the Z-A button
    buttonZA.type = "button";
    buttonZA.addEventListener('click', () => requestJournalSort(sheet, 'desc'));

    //console.log("QJPS: ZA Button: ",buttonZA)

    let qjpContainer = html.querySelector(".qjp-buttons") ?? false;

    //console.log("QJPS: qipContainer ",qjpContainer);
    if (qjpContainer) {
        //console.log("QJPS: BACK war zuerst da")
        //console.log("QJPS: Normal Tree Choice 1")
        qjpContainer.classList.add('qjps');
        const targetButtonForward = html.querySelector(".qjp-buttons .qjp-forward");

        if (targetButtonForward) {
            // AZ Button after the Forward-Button
            targetButtonForward.insertAdjacentElement("afterend", buttonAZ);
        }
        const targetButtonBack = html.querySelector(".qjp-buttons .qjp-back");
        if (targetButtonBack) {
            // ZA Button before the Back-Button
            targetButtonBack.insertAdjacentElement("beforebegin", buttonZA);
        }

    } else {
        // create group div for new Buttons
        //console.log("QJPS: Else Tree reached")
        const newDiv = document.createElement('div');
        newDiv.classList.add('flexrow', 'qjp-buttons', 'qjps');  // buttonS class added to div
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
        //console.log("QJPS: Container before append child: ",container);
        //console.log("QJPS: newDiv before append child: ",newDiv);
        //console.log("QJPS: newDiv before append child: ",buttonsDiv);

        container.appendChild(newDiv);
        container.appendChild(buttonsDiv);
        //remove the class flexrow from the previous container but keep action-buttons as it styles the container to be on the bottom of the pane
        container.classList.remove('flexrow');
        //console.log("QJPS: Conatiner element: ", container)
    }

};
