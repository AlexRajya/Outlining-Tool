// Outlining tool JS code
let lastKey;// global variable to check if double enter is pressed
let ws;
const myid = Math.random().toString(36).substring(2);// Unique id for each client

function setEndOfContenteditable(contentEditableElement) {
  // append cursor to end of a contentEditable Element
  let range; let selection;
  if (document.createRange) {
    try {
      range = document.createRange();
      range.selectNodeContents(contentEditableElement);
      range.collapse(false);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (err) {
      console.log(`invalid cursor position:${err}`);
    }
  }
}

function insertAtCursor(ele) { // insert node at current cursor pos
  let sel; let range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(ele);
      // Preserve the selection
      range = range.cloneRange();
      range.setStartAfter(ele);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

function save() { // Save data sent to server to be saved
  const saveData = document.getElementById('textBody').innerHTML;
  const sendObj = { innerHTML: 'toBeReplaced' };
  sendObj.innerHTML = saveData;
  const sendJSON = JSON.stringify(sendObj);

  const url = `${window.location.href}save`;
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(sendJSON);
}

function toggle(e) { // Open list on clicking "+" toggler or close on "-"
  let nestedUl;
  const toggler = e.target;
  nestedUl = toggler.parentElement;
  while (nestedUl.querySelector('.nested') === null) {
    nestedUl = nestedUl.parentElement;
  }
  if (nestedUl.querySelector('.nested').classList.contains('active')) {
    nestedUl.querySelector('.nested').classList.remove('active');
    toggler.classList.remove('caret-down');
  } else {
    nestedUl.querySelector('.nested').classList.add('active');
    toggler.classList.add('caret-down');
  }
}

function setNew() { // used to replace "edit me" text on click
  const newText = document.getElementsByClassName('new');
  for (let i = 0; i < newText.length; i += 1) {
    newText[i].addEventListener('click', function () {
      if (this.classList.contains('new')) {
        this.focus();
      }
    });
    newText[i].addEventListener('keydown', function (e) {
      if (this.classList.contains('new')) {
        if ((e.key).length === 1) { // Checks if alphanumeric or special key e.g. ctrl is pressed
          this.textContent = e.key;
          setEndOfContenteditable(e.target);
          e.preventDefault();
          this.classList.remove('new');
        }
      }
    });
  }
}

async function pageLoaded() {
  // Load page from txt file containing json object of save data
  const response = await fetch('code.txt');
  const text = await response.text();
  const saveData = JSON.parse(text);
  const textBody = document.getElementById('textBody');
  textBody.innerHTML = saveData.innerHTML;
  const togglers = document.getElementsByClassName('caret');
  for (let i = 0; i < togglers.length; i += 1) {
    togglers[i].addEventListener('click', toggle);
  }
  setNew();
}

function getPos(parentEle, element) {
  // Get currently selected elements pos amongst parent's children
  let pos;
  for (let i = 0; i < (parentEle.children).length; i += 1) {
    if (parentEle.children[i] === element) {
      pos = i;
    }
  }
  return pos;
}

function getParentLi(ele) { // find parent LI of a text node
  let element = ele;
  while (element.tagName !== 'LI') {
    element = element.parentElement;
  }
  return element;
}

function getParentUl(ele) { // find parent UL of LI element
  let element = ele;
  while (element.tagName !== 'UL') {
    element = element.parentElement;
  }
  return element;
}

function newOutline() {
  // Create new tree and Li
  const tree = document.createElement('ul');
  tree.classList.add('tree');
  const parentLi = document.createElement('li');
  parentLi.classList.add('parent');
  tree.appendChild(parentLi);
  // Children of Li and nested list
  const span1 = document.createElement('span');
  span1.classList.add('caret');
  const span2 = document.createElement('span');
  span2.classList.add('new');
  span2.tabIndex = '0';
  span2.textContent = 'Edit me';
  const nestedUl = document.createElement('ul');
  nestedUl.classList.add('nested');

  parentLi.appendChild(span1);
  parentLi.appendChild(span2);
  parentLi.appendChild(nestedUl);
  // appending into nested Li
  const nestedLi = document.createElement('li');
  nestedUl.appendChild(nestedLi);
  const span3 = document.createElement('span');
  span3.classList.add('new');
  span3.tabIndex = '0';
  span3.textContent = 'Edit me';
  nestedLi.appendChild(span3);
  // append at cursor
  const sel = window.getSelection();
  let element = sel.anchorNode;
  if (element.classList === undefined) { // Checks if inserting on text node
    element = element.parentElement;
  }
  if (element.id === 'textBody' || element.tagName === 'DIV' || element.tagName === 'UL') {
    insertAtCursor(tree);
  } else {
    element = getParentLi(element);
    const parentEle = getParentUl(element);
    const pos = getPos(parentEle, element);

    if ((parentEle.children[pos]).textContent !== '') {
      span2.textContent = parentEle.children[pos].textContent;
      parentEle.children[pos].remove();
    }
    parentEle.insertBefore(parentLi, parentEle.children[pos]);
    setEndOfContenteditable(parentLi);
  }
  // Set event listeners for new tree
  span1.addEventListener('click', toggle);
  span1.addEventListener('click', forceRefresh);
  setNew();
  lastKey = undefined;
  forceRefresh();
}

function checkParentClass() { // Checks if any element that should not contains parent class
  const parents = document.getElementsByClassName('parent');
  for (let i = 0; i < parents.length; i += 1) {
    if (parents[i].querySelector('.nested') === null) {
      parents[i].classList.remove('parent');
    }
  }
}

let lastCount;// Variable to check element length

function moveElement(keyPressed) {
  const sel = window.getSelection();
  let ele = sel.anchorNode;
  let parentEle = ele;
  ele = getParentLi(ele);

  if (ele.parentElement.id !== 'textBody') {
    parentEle = getParentUl(ele);
  } else {
    parentEle = ele.parentElement;
  }

  let pos = getPos(parentEle, ele);
  // Check whether to move up or down
  if (keyPressed === 40) {
    parentEle.insertBefore(ele, parentEle.children[pos + 2]);
  } else if (keyPressed === 38) {
    if (pos === 0) {
      try {
        while (parentEle.classList.contains('parent') === false) {
          parentEle = parentEle.parentElement;
        }
        if (parentEle.parentElement.id === 'textBody') {
          parentEle = parentEle.parentElement;
          parentEle.insertBefore(ele, parentEle.children[pos - 1]);
        } else {
          const treeEle = parentEle;
          parentEle = parentEle.parentElement;// break out of current UL to next level up
          parentEle = getParentUl(parentEle);
          pos = getPos(parentEle, treeEle);
          parentEle.insertBefore(ele, parentEle.children[pos]);
        }
      } catch (err) {
        console.log('top of document, cannot go up');
      }
    } else if ((parentEle.children[pos - 1]).classList.contains('parent')) { // Checks if element above is on a new level
      const treeElement = parentEle.children[pos - 1];
      const newUL = treeElement.getElementsByClassName('active')[0];
      if (newUL !== undefined) {
        newUL.appendChild(ele);
      } else {
        parentEle.insertBefore(ele, parentEle.children[pos - 1]);
      }
    } else {
      parentEle.insertBefore(ele, parentEle.children[pos - 1]);
    }
  }
  setEndOfContenteditable(ele);
}

function checkChildren() { // Removes "+/-" if element has no children
  let parentLi;
  const nestedUls = document.getElementsByClassName('nested');
  for (let i = 0; i < nestedUls.length; i += 1) {
    if (nestedUls[i].children.length === 0) {
      try {
        parentLi = nestedUls[i].parentElement;
        parentLi.querySelector('.caret').classList.remove('caret-down');
        parentLi.querySelector('.caret').classList.remove('caret');
      } catch (err) {
        // ignore as sometimes nested li is deleted when last child removed
      }
    }
  }
}

function doubleEnterPress(ele) {
  let parentEle = ele.parentElement;
  while (parentEle.classList.contains('parent') === false) {
    parentEle = parentEle.parentElement;
  }
  const { children } = parentEle;
  for (let i = 0; i < children.length; i += 1) {
    if (children[i].classList.contains('active')) {
      children[i].classList.remove('active');
    } else if (children[i].classList.contains('caret-down')) {
      children[i].classList.remove('caret-down');
    }
  }
}

function deleteNode(ele) {
  let parentEle = ele;
  if (ele.parentElement.id !== 'textBody') {
    parentEle = getParentUl(parentEle);
  } else {
    parentEle = ele.parentElement;
  }
  const pos = getPos(parentEle, ele);
  ele.remove();
  try {
    setEndOfContenteditable(parentEle.children[pos - 1]);
  } catch (err) {
    setEndOfContenteditable(parentEle);
  }
}

function checkKey(e) { // function to add functionality to key presses
  const code = e.keyCode;
  const sel = window.getSelection();
  let ele = sel.anchorNode;
  checkParentClass();// removes elements that contain parent class without having any children
  if (code === 13 && lastKey === 13) {
    try {
      doubleEnterPress(ele);
      e.preventDefault();
    } catch (err) {
      console.log(`Error:${err}`);
    }
    lastKey = undefined;
  } else if (code === 9) {
    e.preventDefault();
    document.execCommand('indent');
  } else if (code === 8) {
    if (lastCount === 1 || ele.textContent.length === 0) {
      if (ele.parentElement.tagName !== 'DIV') {
        e.preventDefault();
        ele = getParentLi(ele);
        deleteNode(ele);
      }
      checkChildren();
      lastCount = undefined;
    } else {
      lastCount = ele.textContent.length;
    }
  } else {
    lastKey = code;
  }

  const ctrlPressed = e.ctrlKey;
  if (ctrlPressed) {
    ele.parentElement.focus();// focus element available for moving
    if (code === 39) { // CTRL RIGHTARROW creates new level
      newOutline();
      e.preventDefault();
    } else if (code === 40 || code === 38) { // CTRL UP/DOWN moves element
      if (ele.id !== 'textBody') {
        e.preventDefault();
        moveElement(code);
      }
    }
  }
}


let ctrlWasPressed;// Update when after someone moves an element with CTRL UP/DOWN
function checkCTRL(e) {
  if (e.ctrlKey === false && ctrlWasPressed === true) {
    forceRefresh();
    lastKeyUp = undefined;
    ctrlWasPressed = false;
  }
  if (e.keyCode === 17) {
    ctrlWasPressed = true;
  }
}

function saveSelection(containerEl) { // save clients cursor position
  const doc = containerEl.ownerDocument;
  const win = doc.defaultView;
  const range = win.getSelection().getRangeAt(0);
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(containerEl);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  const start = preSelectionRange.toString().length;

  return {
    start,
    end: start + range.toString().length,
  };
}

function restoreSelection(containerEl, savedSel) { // restore clients cursor pos
  const doc = containerEl.ownerDocument;
  const win = doc.defaultView;
  let charIndex = 0;
  const range = doc.createRange();
  range.setStart(containerEl, 0);
  range.collapse(true);
  const nodeStack = [containerEl];
  let node; let foundStart = false; let stop = false;

  while (!stop && (node = nodeStack.pop())) {
    if (node.nodeType === 3) {
      const nextCharIndex = charIndex + node.length;
      if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
        range.setStart(node, savedSel.start - charIndex);
        foundStart = true;
      }
      if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
        range.setEnd(node, savedSel.end - charIndex);
        stop = true;
      }
      charIndex = nextCharIndex;
    } else {
      let i = node.childNodes.length;
      while (i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }
  }

  const sel = win.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}


// WEBSOCKET FUNCTIONS
function receivedMessageFromServer(e) {
  const clientEdit = JSON.parse(e.data);
  if (clientEdit.sync && clientEdit.id !== myid) { // If new client, sync with other clients
    forceRefresh();
    console.log('Synced');
  } else if (clientEdit.sync === undefined && clientEdit.id !== myid) { // If not new client, update textBody
    const textBody = document.getElementById('textBody');

    textBody.focus();
    const divSelection = saveSelection(textBody);

    textBody.innerHTML = clientEdit.content;
    textBody.focus();
    while(saveSelection(textBody).start !== divSelection.start){
      restoreSelection(textBody, divSelection);
    }

    // reset event listeners
    const togglers = document.getElementsByClassName('caret');
    for (let i = 0; i < togglers.length; i += 1) {
      togglers[i].addEventListener('click', toggle);
      togglers[i].addEventListener('click', forceRefresh);
    }
    setNew();
  }
}

let buffer = [];// Buffer to update other clients every 15 chars
function refresh(e) {
  // JSON object to send necessary information to other clients
  const clientEdit = {
    content: document.getElementById('textBody').innerHTML,
    id: myid,
    sync: undefined,
  };
  buffer.push(e.keyCode);
  if (e.keyCode === 32 || buffer.length >= 3) {
    // sync clients on spacebar or buffer is greater than 15
    ws.send(JSON.stringify(clientEdit));
    buffer = [];
  }
}

function forceRefresh() { // Force update on certain client interactions
  const clientEdit = {
    content: document.getElementById('textBody').innerHTML,
    id: myid,
    sync: undefined,
  };
  ws.send(JSON.stringify(clientEdit));
}

function syncClients() { // Sync function for new client
  try {
    const clientEdit = {
      content: document.getElementById('textBody').innerHTML,
      id: myid,
      sync: true,
    };
    ws.send(JSON.stringify(clientEdit));
    clearInterval(sync);
  } catch (err) {
    console.log('Not connected to websocket');
  }
}

let sync = setInterval(syncClients, 500);// Deleted after forcing sync to new client
// END OF WEBSOCKET FUNCTIONS

// Initialise
window.onload = () => {
  try { // Connect to websocket
    ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);
    ws.addEventListener('message', receivedMessageFromServer);
  } catch (err) {
    console.log('failed to connect to WebSocket');
  }
  pageLoaded();
  // Sticky Header JS code
  const header = document.getElementById('stickyHeader');
  const sticky = header.offsetTop;

  function stick() {
    if (window.pageYOffset > sticky) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  }

  window.onscroll = () => {
    stick();
  };
  // Modal listeners
  document.getElementById('helpButton').addEventListener('click', () => {
    document.getElementById('Modal').style.display = 'block';
  });
  document.getElementById('close').addEventListener('click', () => {
    document.getElementById('Modal').style.display = 'none';
  });
  window.onclick = (e) => {
    if (e.target === document.getElementById('Modal')) {
      document.getElementById('Modal').style.display = 'none';
    }
  };
  // text to speech button in help Modal
  const txt = document.getElementById('helpText').textContent;
  const message = new SpeechSynthesisUtterance(txt);
  function speak() {
    speechSynthesis.speak(message);
  }
  document.getElementById('textToSpeech').addEventListener('click', speak);
  // Event listeners
  document.getElementById('textBody').addEventListener('keydown', checkKey);
  document.getElementById('textBody').addEventListener('keyup', refresh);
  document.getElementById('textBody').addEventListener('keyup', checkCTRL);

  window.boldButton.addEventListener('click', () => {
    document.execCommand('bold', false, null);
  });
  window.italicButton.addEventListener('click', () => {
    document.execCommand('italic', false, null);
  });
  window.underlineButton.addEventListener('click', () => {
    document.execCommand('underline', false, null);
  });
  window.fontColorButton.addEventListener('change', (e) => {
    document.execCommand('ForeColor', false, e.target.value);
  });
  window.BGColorButton.addEventListener('change', (e) => {
    document.execCommand('BackColor', false, e.target.value);
  });
  window.fontChanger.addEventListener('change', (e) => {
    document.execCommand('FontName', false, e.target.value);
  });
  window.fontSizeChanger.addEventListener('change', (e) => {
    document.execCommand('FontSize', false, e.target.value);
    e.target.value = 1;
  });
  window.outlineButton.addEventListener('click', newOutline);
  window.saveButton.addEventListener('click', save);
  window.clearButton.addEventListener('click', () => {
    if (window.confirm('Are you sure you want to clear the page?')) {
      console.log('document cleared');
      document.getElementById('textBody').innerHTML = '';
      forceRefresh();
    }
  });

  window.addEventListener('pagehide', save);
  window.addEventListener('beforeunload', save);
};
