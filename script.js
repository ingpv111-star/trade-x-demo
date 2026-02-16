let plan = localStorage.getItem("plan") || "FREE";
let balance = parseFloat(localStorage.getItem("balance")) || 10000;
let price = 100;
let trades = JSON.parse(localStorage.getItem("trades")) || [];
let currentTrade = null;

let chartData = [];

const planEl = document.getElementById("planType");
const balanceEl = document.getElementById("balance");
const priceEl = document.getElementById("price");
const historyEl = document.getElementById("history");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

/* ---------- INIT PLAN ---------- */

function initPlan(){
  if(plan==="399"){ balance=1000000; }
  if(plan==="999"){ balance=10000000; }
}

/* ---------- UPDATE UI ---------- */

function updateUI(){
  planEl.innerText = plan;
  balanceEl.innerText = "Balance: ₹" + balance.toFixed(2);
  priceEl.innerText = "Price: " + price.toFixed(2);

  historyEl.innerHTML = "";
  trades.slice().reverse().forEach(t=>{
    let div=document.createElement("div");
    div.innerText=`${t.type} | Entry:${t.entry} | Exit:${t.exit} | P/L: ₹${t.pl}`;
    historyEl.appendChild(div);
  });
}

/* ---------- DRAW CHART ---------- */

function drawChart() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if(chartData.length < 2) return;

  let min = Math.min(...chartData);
  let max = Math.max(...chartData);
  let range = max - min;
  if(range === 0) range = 1;

  ctx.beginPath();
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2;

  chartData.forEach((p, i) => {

    let x = (i / chartData.length) * canvas.width;
    let y = canvas.height - ((p - min) / range) * canvas.height;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

/* ---------- PRICE MOVEMENT ---------- */

function movePrice(){
  price += (Math.random() - 0.5) * 2;

  chartData.push(price);
  if(chartData.length > 50) chartData.shift();

  drawChart();
  updateUI();
}

setInterval(movePrice, 1000);

/* ---------- TRADING ---------- */

function openTrade(type){
  if(balance <= 0 && plan==="FREE") return alert("Balance Finished.");
  if(currentTrade) return alert("Trade running");

  let lot=parseFloat(document.getElementById("lot").value)||1;
  let sl=parseFloat(document.getElementById("sl").value);
  let target=parseFloat(document.getElementById("target").value);

  if(!sl || !target) return alert("Enter SL & Target");

  currentTrade={type,entry:price,lot,sl,target};
}

function upgrade(type){
  plan=type.toString();
  localStorage.setItem("plan",plan);
  initPlan();
  localStorage.setItem("balance",balance);
  alert("Upgraded to ₹"+type+" Plan");
  updateUI();
}

function resetBalance(){
  if(plan==="FREE") return alert("Premium Only");

  if(plan==="399") balance=1000000;
  if(plan==="999") balance=10000000;

  localStorage.setItem("balance",balance);
  alert("Balance Reset Done");
  updateUI();
}

function inviteReward(){
  balance+=1000;
  localStorage.setItem("balance",balance);
  alert("Invite Reward ₹1000 Added");
  updateUI();
}

/* ---------- START ---------- */

initPlan();
updateUI();
