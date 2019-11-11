//Outlining tool JS code
let lastKey;//global variable to check if double enter is pressed
let temp;
init();

function init(){
  //Sticky Header JS code
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
}

function save(){
  let toggler = document.getElementsByClassName("caret");
  for (let i = 0; i < toggler.length; i++){
    toggler[i].setAttribute("listen","false");
  }
  mytext = document.getElementById("textBody").innerHTML;
  var myObj = {innerHTML:"yyy"};
  myObj.innerHTML = mytext;
  myJSON = JSON.stringify(myObj);

  let url = window.location.href;
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(myJSON);
}

//Not yet used - To be used to replace "edit me" text with JS
function setNew(){
  let newO = document.getElementsByClassName("new");
  for (let i = 0; i < newO.length; i++){
    newO[i].addEventListener("click",function(e){
      if(this.classList.contains("new")){
        //this.focus();
      }
    });
    newO[i].addEventListener("keydown",function(e){
      if(this.classList.contains("new")){
        //insert code to replace text
        this.classList.remove("new");
      }
    });
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

function appendNewOutline() { //appends new tree to text body (not yet used)
  let code = '<ul class="tree"><li><span class="caret"></span><span>Edit me</span><ul class="nested"><div>Edit me</div></ul></li></ul>';
  document.getElementById("textBody").insertAdjacentHTML('beforeend', code);
  setAtt();
  addListeners();
}

function createNewTree() { //Button press
  let code = '<ul class="tree"><li><span class="caret"></span><span class="new">Edit me</span><ul class="nested"><li><span>Edit me</span></li><li></li></ul></li></ul>';
  document.execCommand('insertHTML', false, code);
  setAtt();
  addListeners();
  setNew();
  lastKey = undefined;
}

function checkKey(e){//function to add functionality to key presses
  var code = (e.keyCode ? e.keyCode : e.which);
  if (code == 13 && lastKey == 13){
    if(e.target.id !== "textBody"){
      document.execCommand('outdent');
      e.preventDefault();
    }
    lastKey = undefined;
    //createNewOutline();
  }else if (code == 8 && lastKey == 8){
    //delete key
    lastKey = undefined;
  }else if (code == 9){
    e.preventDefault();
    document.execCommand("indent");
  }else{
    lastKey = code;
  }
}
