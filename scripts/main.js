console.log("== Hello World! This code runs immediately when the file is loaded.");

Hooks.on("init", function() {
  console.log("== This code runs once the Foundry VTT software begins its initialization workflow.");
});

Hooks.on("ready", function() {
  console.log("== This code runs once core initialization is ready and game data is available.");
  console.log("== Existing registered Hook events",Hooks.events)
});

// Render or Journal open function
//Hooks.on("renderJournalSheet", function() {
 //console.log("A journal was rendered (opened)");
//});

// Render or Journal open function
Hooks.on("renderJournalSheet", (sheet,html,data) => {
 console.log("A journal was rendered (opened)");
 console.log(sheet)
 console.log(html)

const container = document.querySelector("aside.journal-sidebar div.action-buttons.flexrow");

const buttonAZ = document.createElement('button');
buttonAZ.className = 'sort-button';  // Foundry button class
buttonAZ.title = 'Sort A-Z';         // Native title for tooltip
buttonAZ.innerHTML = '<i class="fa-solid fa-sort-alpha-down fas"></i>';  // Correct FA classes
buttonAZ.addEventListener('click', () => {
  const journal = sheet.document;
  console.log("Sort A-Z:", journal.name, journal.id);
});

const buttonZA = document.createElement('button');
buttonZA.className = 'sort-button';
buttonZA.title = 'Sort Z-A';
buttonZA.innerHTML = '<i class="fa-solid fa-sort-alpha-down-alt fas"></i>';  // Z-A icon
buttonZA.addEventListener('click', () => {
  const journal = sheet.document;
  console.log("Sort Z-A:", journal.name, journal.id);
});

const newDiv = document.createElement('div');
newDiv.classList.add('flexrow', 'sort-buttons');  // Better class name
newDiv.appendChild(buttonAZ);
newDiv.appendChild(buttonZA);

const buttonsDiv = document.createElement('div');
buttonsDiv.classList.add('action-buttons', 'flexrow');
while (container.firstChild) {
  buttonsDiv.appendChild(container.firstChild);
}

container.appendChild(newDiv);
container.appendChild(buttonsDiv);
container.classList.remove('flexrow');


/*
const standardButtonsDiv = html.find("aside.journal-sidebar div.action-buttons.flexrow")
console.log("Standard Buttons: ",standardButtonsDiv)

const newButtons = document.createElement('div');
console.log("New Div:",newButtons)
newButtons.className='sort-buttons'
newButtons.textContent="NEW Buttons here!"
newButtons.style.backgroundColor = 'var(--color-border-light-primary)';
console.log("New Buttons:",newButtons)
const newButtonGroup = document.createElement('div');
console.log("Empty new Button Group?",newButtonGroup)
newButtonGroup.append(newButtons)
//newButtonGroup.append(standardButtonsDiv)

const array = Array.from(html.find("aside.journal-sidebar div.action-buttons.flexrow"))
console.log(array)
newButtonGroup.append(array)
console.log("Empty new Button Group 2",newButtonGroup)
/*
const standardButtonsInnerHTML= standardButtonsDiv[0].innerHTML
console.log("Standard Buttons Inner HTML: ",standardButtonsInnerHTML)
const newStandardButtons =`<div class="action-buttons flexrow">${standardButtonsInnerHTML}</div>`
console.log("New Standard Buttons: ",newStandardButtons)
const newButtons = `<div>TEST STUFF</div>`
const newDiv =`<div>${newButtons}${newStandardButtons}</div>`
console.log("Final new Div:" , newDiv)

standardButtonsDiv.replaceWith(newDiv); 
/*
/*
/*
 const uiElement = html.find("aside.journal-sidebar div.action-buttons.flexrow")
 console.log("Gefundenes Element: ",uiElement)

 const sidebar = html.find("aside.journal-sidebar")
 console.log("Sidebar: ",sidebar)

const targetDiv = sidebar.find('div:last-of-type');
console.log("LAST DIV: ",targetDiv)

const uiElementInner = uiElement.innerHTML

uiElement.innerHTML = `
  <div>More buttons</div>
  <div>${uiElementInner}</div>
`;
*/
 //const text = $(`<br><div> MORE text </div>`)
 
//let newDiv = '<div style="background-color: red; padding: 10px; color: white;">Content</div>'
//sidebar.insertBefore(newDiv, targetDiv); 
 /*
 const newDiv = document.createElement('div');
newDiv.textContent = 'New content';
newDiv.style.backgroundColor = 'red';  // Sets red background
newDiv.style.padding = '10px';         // Optional: add padding for visibility
sidebar.appendChild(newDiv);
*/


//uiElement.insertBefore(newDiv, uiElement);

//uiElement.append('<div style="background-color: red; padding: 10px; color: white;">Content</div>');
 

  //uiElement.find(".next").first().after(button);
 
  //uiElement.append(text)
});

/*
Hooks.on("renderJournalSheet", (sheet, html) => {
  const header = html.find(".window-header");
  html.find(".my-journal-button").remove();
  
  const button = $(`
    <div class="header-button my-journal-button" title="Quick Action">
      <i class="fas fa-lightning-bolt"></i> Quick
    </div>
  `).click(() => {
    // Access the current journal
    const journal = sheet.document;
    console.log("Journal:", journal.name, journal.id);
    
    // Example actions:
    // journal.update({ "flags.my-module.-=hidden": null });
    // ChatMessage.create({ content: Updated ${journal.name} });
  });
  
  // Insert after the close button (first header button)
  header.find(".header-button").first().after(button);
});
*/