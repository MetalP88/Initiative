'use strict'

const list = document.getElementById("lista");
const details = document.getElementById("reference");
const statusText = document.getElementById("status");
const newItemForm = document.getElementById("newItemForm");
const playerNew = document.getElementById("playerNew");
const initiativeNew = document.getElementById("initiativeNew");
const modal = document.getElementById("modal");
const overlay = document.getElementById("overlay");
let players = [];
let turn = 0;

function loadData() {
  const dataPlayer = JSON.parse(localStorage.getItem('players'));
  const dataTurn = JSON.parse(localStorage.getItem('turn'));
  if (!dataPlayer) return;
  turn = dataTurn;
  $("#turnCounter").text(turn)
  players = dataPlayer;
  players.forEach((x) => renderPG(x));
  $('document').ready(function() {
    players.forEach((x) => applyStatus(x));
  })
};
loadData();

function saveData() {
  localStorage.setItem('players', JSON.stringify(players));
  localStorage.setItem('turn', JSON.stringify(turn))
};

function reset() {
  localStorage.removeItem('players');
  location.reload();
}


$("#turnBtnPlus").click(function() {
  turn++;
  $("#turnCounter").text(turn);
  saveData();
});

$("#turnBtnMinus").click(function() {
  turn--;
  $("#turnCounter").text(turn);
  saveData();
});

$("#modalBtnOpen").click(function(){
  overlay.classList.toggle('active');
  modal.classList.toggle('active');
});

$("#modalBtnClose,#overlay").click(function(){
  overlay.classList.toggle('active');
  modal.classList.toggle('active');
});

//Event listener that activate when the drag element is over the list
list.addEventListener('dragover', (e) => {
  e.preventDefault();
  const moving = document.querySelector(".dragging");
  const afterEl = position(list, e.clientY);
  // console.log(afterEl);
  if (afterEl == null) {
    list.appendChild(moving);
  } else {
    list.insertBefore(moving, afterEl);
  }
});

//creating new item from the form
newItemForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = playerNew.value;
  const init = initiativeNew.value;
  if (name.trim() === "" || init === "") {
    clean();
    return;
  };
  let check = false;
  players.forEach((x) => {
    if (name === x.name) {
      alert('name already in use');
      return check = true;
    }
  });
  // console.log(check);
  if (check) {
    clean();
    return;
  };
  const player = {
    name:name.trim(),
    nameID:name.trim().replaceAll(/ /g, "-"),
    initiative:init*1,
    note:`Initiative ${init}`,
    active:false,
    death:false
  };
  players.push(player);
  renderPG(player);
 
  //adding Event listener to the new item for class application
  
  // $("li.drag").on('dragstart', function() {
  //   child.classList.add('dragging')
  // });
  // $("li.drag").on('dragend', function() {
  //   child.classList.remove('dragging')
  // });
  clean();
});

//function that return the position of the dragged element related to the element in the list
function position(container, y) {
  const dragEl = [...container.querySelectorAll(".drag")];
  return dragEl.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return {offset: offset, element: child}
    } else {
      return closest;
    }
  }, {offset: Number.NEGATIVE_INFINITY}).element;
};

function renderPG(pg) {
  const child = document.createElement("li");
  child.classList.add("drag");
  child.setAttribute("draggable", true);
  child.insertAdjacentHTML("afterbegin", `
    <div class="line">
      <div>
        <input type="radio" name="playerlist" id="${pg.nameID}-active"><label for="${pg.nameID}-active">Active</label>
      </div>
      <div class="name" name="pname">${pg.name}</div>
      <div>
        <input type="checkbox" name="${pg.nameID}-death" id="${pg.nameID}-death">
      </div>
    </div>`);
  list.appendChild(child);
  child.addEventListener('mousedown', show);
  document.getElementById(pg.nameID +'-active').addEventListener('change', active);
  document.getElementById(pg.nameID +'-death').addEventListener('change', death);
  document.querySelectorAll("li.drag").forEach(item => {
    child.addEventListener('dragstart', () => {
      child.classList.add('dragging');
    })
    child.addEventListener('dragend', () => {
      child.classList.remove('dragging');
    })
  });
};

function applyStatus(pg) {
  if (pg.death) {
    $(`#${pg.nameID}-death`).click();
  };
  if (pg.active) {
    $(`#${pg.nameID}-active`).click();
  };
  // pg.death ? $(`#${pg.nameID}-death`).click() : $(`#${pg.nameID}-death`).attr('checked', false);
}

$("#sortInit").click(function(e){
  sortInitiative(e, players);
});

function sortInitiative (e, arr) {
  if ($("li.drag").length === 0) return;
  $("li.drag").remove();
  arr.sort(sortPGs);
  arr.forEach((x) => renderPG(x));
  e.target.classList.add("hide");
}

function sortPGs(a, b){
  return b.initiative - a.initiative;
};

function show (e) {
  // details.textContent = e.target.closest(".line").textContent;
  details.textContent = e.target.closest('.line').querySelector('[name="pname"]').textContent;
  const nameSearch = details.textContent;
  const ind = players.findIndex(x => x.name == nameSearch);
  statusText.value = players[ind].note;
  statusText.focus();
  saveData();
};

function active(e) {
  // $('[name="pname"]').removeClass("active-player");
  const el = e.target.closest(".line").querySelector('[name="pname"]');
  // el.classList.add('active-player');
  $(".line").removeClass("active-player");
  e.target.closest(".line").classList.add("active-player")
  players.forEach((x) => x.active = false);
  const ind = players.findIndex(x => x.name == el.textContent);
  players[ind].active = true;
  saveData();
};

function death (e) {
  const el = e.target.closest(".line").querySelector('[name="pname"]');
  el.classList.toggle('death-player');
  const ind = players.findIndex(x => x.name == el.textContent);
  console.log(e.target.checked);
  players[ind].death = e.target.checked;
  saveData();
};

function clean() {
  playerNew.value = "";
  initiativeNew.value = "";
  playerNew.focus();
};

function saveNote() {
  const text = statusText.value;
  const nameID = details.textContent;
  if (nameID === "") return;
  const ind = players.findIndex(x => x.name == nameID);
  players[ind].note = text;
  saveData();
};