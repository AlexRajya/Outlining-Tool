// Outlining tool JS code
let lastKey;// global variable to check if double enter is pressed

function setEndOfContenteditable(contentEditableElement) {
  let range; let selection;
  if (document.createRange) {
    try{
      range = document.createRange();
      range.selectNodeContents(contentEditableElement);
      range.collapse(false);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }catch(err){
      console.log(`invalid cursor position:${err}`);
    }
  }
}

function insertAtCursor(ele) {
  let sel; let
    range;
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

function save() {
  const saveData = document.getElementById('textBody').innerHTML;
  const sendObj = { innerHTML: 'yyy' };
  sendObj.innerHTML = saveData;
  const sendJSON = JSON.stringify(sendObj);

  const url = window.location.href;
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(sendJSON);
}

function toggle(e) {
  let temp;
  const toggler = e.target;
  temp = toggler.parentElement;
  while (temp.querySelector('.nested') === null) {
    temp = temp.parentElement;
  }
  if (temp.querySelector('.nested').classList.contains('active')) {
    temp.querySelector('.nested').classList.remove('active');
    toggler.classList.remove('caret-down');
  } else {
    temp.querySelector('.nested').classList.add('active');
    toggler.classList.add('caret-down');
  }
}

function setNew() { // used to instant replace "edit me" text
  const newO = document.getElementsByClassName('new');
  for (let i = 0; i < newO.length; i += 1) {
    newO[i].addEventListener('click', function() {
      if (this.classList.contains('new')) {
        this.focus();
      }
    });
    newO[i].addEventListener('keydown', function(e) {
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
  const response = await fetch('code.txt');
  const text = await response.text();
  const obj = JSON.parse(text);
  const tb = document.getElementById('textBody');
  tb.innerHTML = obj.innerHTML;
  const togglers = document.getElementsByClassName('caret');
  for (let i = 0; i < togglers.length; i += 1) {
    togglers[i].addEventListener('click', toggle);
  }
  setNew();
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
    let pos;
    let parentEle = element;

    while (element.tagName !== 'LI') {
      element = element.parentElement;
    }
    while (parentEle.tagName !== 'UL') {
      parentEle = parentEle.parentElement;
    }

    for (let i = 0; i < (parentEle.children).length; i += 1) {
      if (parentEle.children[i] === element) {
        pos = i;
      }
    }
    if ((parentEle.children[pos]).textContent !== '') {
      span2.textContent = parentEle.children[pos].textContent;
      parentEle.children[pos].remove();
    }
    parentEle.insertBefore(parentLi, parentEle.children[pos]);
    setEndOfContenteditable(parentLi);
  }
  // Set event listeners for new tree
  span1.addEventListener('click', toggle);
  setNew();
  lastKey = undefined;
}

function checkParentClass() {
  const parents = document.getElementsByClassName('parent');
  for (let i = 0; i < parents.length; i += 1) {
    if (parents[i].querySelector('.nested') === null) {
      parents[i].classList.remove('parent');
    }
  }
}

let lastCount;

function moveElement(keyPressed) {
  const sel = window.getSelection();
  let ele = sel.anchorNode;
  let pos;
  let parentEle = ele;

  while (ele.tagName !== 'LI') {
    ele = ele.parentElement;// when moving a subtree li is inside a new tree
  }
  if (ele.parentElement.id !== 'textBody') {
    while (parentEle.tagName !== 'UL') {
      parentEle = parentEle.parentElement;
    }
  } else {
    parentEle = ele.parentElement;
  }

  for (let i = 0; i < (parentEle.children).length; i += 1) {
    if (parentEle.children[i] === ele) {
      pos = i;
    }
  }
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
          parentEle = parentEle.parentElement;
          while (parentEle.tagName !== 'UL') {
            parentEle = parentEle.parentElement;
          }
          for (let i = 0; i < (parentEle.children).length; i += 1) {
            if (parentEle.children[i] === treeEle) {
              pos = i;
            }
          }
          parentEle.insertBefore(ele, parentEle.children[pos]);
        }
      } catch (err) {
        console.log('top of document, cannot go up');
      }
    } else if ((parentEle.children[pos - 1]).classList.contains('parent')) {
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

function checkKey(e) { // function to add functionality to key presses
  const code = e.keyCode;
  const sel = window.getSelection();
  let ele = sel.anchorNode;
  checkParentClass();// removes elements that contain parent class without having any children
  if (code === 13 && lastKey === 13) {
    try {
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
      e.preventDefault();
      while (ele.tagName !== 'LI') {
        ele = ele.parentElement;
      }
      let parentEle = ele;
      if (ele.parentElement.id !== 'textBody') {
        while (parentEle.tagName !== 'UL') {
          parentEle = parentEle.parentElement;
        }
      } else {
        parentEle = ele.parentElement;
      }
      let pos;
      for (let i = 0; i < (parentEle.children).length; i += 1) {
        if (parentEle.children[i] === ele) {
          pos = i;
        }
      }
      const previous = parentEle.children[pos - 1];
      ele.remove();
      setEndOfContenteditable(previous);
    }
  } else {
    lastKey = code;
  }
  lastCount = ele.textContent.length;

  const ctrlPressed = e.ctrlKey;
  if (ctrlPressed) {
    ele.parentElement.focus();
    if (code === 39) {
      newOutline();
      e.preventDefault();
    } else if (code === 40 || code === 38) {
      if (ele.id !== 'textBody') {
        e.preventDefault();
        moveElement(code);
      }
    }
  }
}

window.onload = () => {
  // Sticky Header JS code
  // setInterval(autosave,10000);
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
  // Base event listeners
  document.getElementById('textBody').addEventListener('keydown', checkKey);

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
  window.clearButton.addEventListener('click', () => {
    if (window.confirm('Are you sure you want to clear the page?')) {
      console.log('document cleared');
      document.getElementById('textBody').innerHTML = '';
    }
  });

  window.addEventListener('load', pageLoaded);
  window.addEventListener('pagehide', save);
  window.addEventListener('beforeunload', save);
};
