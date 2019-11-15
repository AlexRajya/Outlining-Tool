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
  window.onclick = function(event) {
    if (event.target == document.getElementById("myModal")) {
      document.getElementById("Modal").style.display = "none";
    }
  }
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
  window.outlineButton.addEventListener("click", createNewTree);
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

  window.addEventListener("beforeunload", save);
}

async function pageLoaded() {
  const response = await fetch('code.txt');
  const text = await response.text();
  let obj = JSON.parse(text);
  const tb = document.getElementById("textBody");
  tb.innerHTML = obj.innerHTML;
  setAtt();
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

function autosave(){//Cursor needs to be noted then removed back to original spot
  save();
  pageLoaded();
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
      toggler[i].addEventListener("click", function toggle(){
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
//document.getElementById("textBody").insertAdjacentHTML('beforeend', code); to append a new tree
function createNewTree() { //Button press
  let code = '<ul class="tree"><li><span class="caret"></span><span class="new" tabindex="0">Edit me</span><ul class="nested"><li><span class="new" tabindex="0">Edit me</span></li><li></li></ul></li></ul>';
  document.execCommand('insertHTML', false, code);
  setAtt();
  addListeners();
  setNew();
  lastKey = undefined;
}

function checkKey(e){//function to add functionality to key presses
  let code = (e.keyCode ? e.keyCode : e.which);
  if (code == 13 && lastKey == 13){
    document.execCommand('outdent');
    document.execCommand('insertHTML', false, "<div></div>");
    e.preventDefault();
    lastKey = undefined;
    //createNewOutline();
  }else if (code == 9){
    e.preventDefault();
    document.execCommand("indent");
  }else{
    lastKey = code;
  }

  let keyPressed = e.keyCode;
  let ctrlPressed = e.ctrlKey;
  if (ctrlPressed && keyPressed == 40) {
    console.log("ctrl pressed");
    createNewTree();
    e.preventDefault();
  }
}
