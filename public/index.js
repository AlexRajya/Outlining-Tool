//Outlining tool JS code
let lastKey;//global variable to check if double enter is pressed
let temp;

init();

function init(){
  //Sticky Header JS code
  //setInterval(autosave,10000);
  window.onscroll = function() {
    stick()
  };

  let header = document.getElementById("stickyHeader");
  let sticky = header.offsetTop;

  function stick() {
    if (window.pageYOffset > sticky) {
      header.classList.add("sticky");
    } else {
      header.classList.remove("sticky");
    }
  }
  //Modal listeners
  document.getElementById("helpButton").addEventListener("click", function() {
    document.getElementById("Modal").style.display = "block";
  });
  document.getElementById("close").addEventListener("click", function() {
    document.getElementById("Modal").style.display = "none";
  });
  window.onclick = function(e) {
    if (e.target == document.getElementById("Modal")) {
      document.getElementById("Modal").style.display = "none";
    }
  }
  //text to speech button in help Modal
  txt = document.getElementById("helpText").textContent;
  let message = new SpeechSynthesisUtterance(txt);
  function speak(){
    speechSynthesis.speak(message);
  }
  document.getElementById("textToSpeech").addEventListener("click", speak);
  //Base event listeners
  document.getElementById("textBody").addEventListener("keydown",checkKey);

  window.boldButton.addEventListener("click", function() {
    document.execCommand('bold', false, null);
  });
  window.italicButton.addEventListener("click", function() {
    document.execCommand('italic', false, null);
  });
  window.underlineButton.addEventListener("click", function() {
    document.execCommand('underline', false, null);
  });
  window.fontColorButton.addEventListener("change", function(e) {
    document.execCommand('ForeColor', false, e.target.value);
  });
  window.BGColorButton.addEventListener("change", function(e) {
    document.execCommand('BackColor', false, e.target.value);
  });
  window.fontChanger.addEventListener("change", function(e) {
    document.execCommand('FontName', false, e.target.value);
  });
  window.fontSizeChanger.addEventListener("change", function(e) {
    document.execCommand('FontSize', false, e.target.value);
  });
  window.outlineButton.addEventListener("click", newOutline);
  window.centerButton.addEventListener("click", function() {
    document.execCommand('justifyCenter', false, null);
  });
  window.leftButton.addEventListener("click", function() {
    document.execCommand('justifyLeft', false, null);
  });
  window.rightButton.addEventListener("click", function() {
    document.execCommand('justifyRight', false, null);
  });
  window.clearButton.addEventListener("click", function() {
    if(window.confirm("Are you sure you want to clear the page?")){
      console.log("document cleared");
      document.getElementById("textBody").innerHTML = "";
    }
  });

  window.addEventListener("load", pageLoaded);
  window.addEventListener("pagehide", save);
  window.addEventListener("beforeunload", save);
}

async function pageLoaded() {
  const response = await fetch('code.txt');
  const text = await response.text();
  let obj = JSON.parse(text);
  const tb = document.getElementById("textBody");
  tb.innerHTML = obj.innerHTML;
  addListeners();
  setNew();
}

function save(){
  let toggler = document.getElementsByClassName("caret");
  for (let i = 0; i < toggler.length; i++){
    toggler[i].setAttribute("listen","false");
  }
  saveData = document.getElementById("textBody").innerHTML;
  var sendObj = {innerHTML:"yyy"};
  sendObj.innerHTML = saveData;
  sendJSON = JSON.stringify(sendObj);

  let url = window.location.href;
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(sendJSON);
}

function setNew(){ //used to instant replace "edit me" text
  let newO = document.getElementsByClassName("new");
  for (let i = 0; i < newO.length; i++){
    newO[i].addEventListener("click",function(e){
      if(this.classList.contains("new")){
        this.focus();
      }
    });
    newO[i].addEventListener("keydown",function(e){
      if(this.classList.contains("new")){
        if((e.key).length == 1){//Checks if alphanumeric or special key e.g. ctrl is pressed
          this.textContent = e.key;
          setEndOfContenteditable(e.target);
          e.preventDefault();
          this.classList.remove("new");
        }
      }
    });
  }
}

function setEndOfContenteditable(contentEditableElement){
    let range,selection;
    if(document.createRange){
        range = document.createRange();
        range.selectNodeContents(contentEditableElement);
        range.collapse(false);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function setAtt(){
  let toggler = document.getElementsByClassName("caret");
  for (let i = 0; i < toggler.length; i++){
    if(toggler[i].getAttribute("listen") == undefined){
      toggler[i].setAttribute("listen","false");
    }
  }
}

function addListeners(){
  let toggler = document.getElementsByClassName("caret");
  for (let i = 0; i < toggler.length; i++){
    if(toggler[i].getAttribute("listen") == "false"){
      toggler[i].addEventListener("click", function(){
        temp = this.parentElement;
        while(temp.querySelector(".nested") == null){
          temp = temp.parentElement;
        }
        if (temp.querySelector(".nested").classList.contains("active")){
          temp.querySelector(".nested").classList.remove("active");
          this.classList.remove("caret-down");
          console.log("closed");
        }else{
          temp.querySelector(".nested").classList.add("active");
          this.classList.add("caret-down");
          console.log("opened");
        }
      });
      toggler[i].setAttribute("listen", "true");
    }
  }
}

function newOutline(){
  //Create new tree and Li
  const tree = document.createElement("ul");
  tree.classList.add("tree");

  const parentLi = document.createElement("li");
  tree.appendChild(parentLi);
  //Children of Li and nested list
  const span1 = document.createElement("span");
  span1.classList.add("caret");
  const span2 = document.createElement("span");
  span2.classList.add("new");
  span2.tabIndex = "0";
  span2.textContent = "Edit me";
  const nestedUl = document.createElement("ul");
  nestedUl.classList.add("nested");

  parentLi.append(span1);
  parentLi.append(span2);
  parentLi.append(nestedUl);
  //appending into nested Li
  const nestedLi = document.createElement("li");
  nestedUl.appendChild(nestedLi);
  const span3 = document.createElement("div");
  span3.classList.add("new");
  span3.tabIndex = "0";
  span3.textContent = "Edit me";
  nestedLi.appendChild(span3);
  //append at cursor
  sel = window.getSelection();
  element = sel.anchorNode;
  if(element.classList == undefined){//Checks if inserting on text node
    element = element.parentElement;
  }
  if(element.id == "textBody"){
    insertAtCursor(tree);
  }else{
    let ele = element;
    let pos;
    let parentEle = ele;

    while (ele.tagName !== 'LI'){
      ele = ele.parentElement;//when moving a subtree li is inside a new tree
    }
    while (parentEle.tagName !== 'UL'){
      parentEle = parentEle.parentElement;
    }

    for (let i = 0; i < (parentEle.children).length; i++){
      console.log(parentEle.children[i]);
      console.log(ele);
      if (parentEle.children[i] == ele){
        pos = i;
      }
    }
    parentEle.insertBefore(tree, parentEle.children[pos]);
    setEndOfContenteditable(tree);
  }
  //Set event listeners for new tree
  setAtt();
  addListeners();
  setNew();
  lastKey = undefined;
}

function insertAtCursor(ele){
  let sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        console.log(sel.anchorNode);
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

function checkKey(e){//function to add functionality to key presses
  let code = (e.keyCode ? e.keyCode : e.which);
  let sel = window.getSelection();
  let ele = sel.anchorNode;

  if (code == 13 && lastKey == 13){
    document.execCommand('outdent');
    e.preventDefault();
    lastKey = undefined;
    //createNewOutline();
  }else if (code == 9){
    e.preventDefault();
    document.execCommand("indent");
  }else if (code == 8){
    if (ele.textContent == ""){
      e.preventDefault();
      while (ele.tagName !== 'LI'){
        ele = ele.parentElement;//when moving a subtree li is inside a new tree
      }
      ele.remove();
    }
  }else{
    lastKey = code;
  }

  let keyPressed = e.keyCode;
  let ctrlPressed = e.ctrlKey;
  if (ctrlPressed) {
    if (keyPressed == 39) {
      newOutline();
      e.preventDefault();
    }else{
      if(ele.id !== "textBody"){
        e.preventDefault();
        moveElement(keyPressed);
      }
    }
  }
}

function moveElement(keyPressed){
  let sel = window.getSelection();
  let ele = sel.anchorNode;
  let pos;
  let parentEle = ele;

  while (ele.tagName !== 'LI'){
    ele = ele.parentElement;//when moving a subtree li is inside a new tree
  }
  while (parentEle.tagName !== 'UL'){
    parentEle = parentEle.parentElement;
  }

  for (let i = 0; i < (parentEle.children).length; i++){
    if (parentEle.children[i] == ele){
      pos = i;
    }
  }

  if (keyPressed == 40) {
    parentEle.insertBefore(ele, parentEle.children[pos+2]);
  }else if (keyPressed == 38) {
    if(pos == 0){
      parentEle = parentEle.parentElement;
      while (parentEle.tagName !== 'UL'){
        parentEle = parentEle.parentElement;
      }
    }
    parentEle.insertBefore(ele, parentEle.children[pos-1]);
  }
  setEndOfContenteditable(ele);
}
