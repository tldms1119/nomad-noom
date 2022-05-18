// 자동적으로 back-end socket.io 와 연결해주는 function
const socket = io();

const welcome = document.getElementById("welcome");
const form = document.querySelector("form");

function backendDone(msg){
    console.log(`Backend says : ${msg}`);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    // callback 함수는 가장 마지막 매개변수로 넘김
    socket.emit("enter_room", input.value, backendDone);
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
