let plan = localStorage.getItem("plan") || "FREE";
let balance = parseFloat(localStorage.getItem("balance")) || 10000;
let price = 100;
let trades = JSON.parse(localStorage.getItem("trades")) || [];
let currentTrade = null;
let lastReset = localStorage.getItem("lastReset") || 0;

let chartData = [];

const planEl = document.getElementById("planType");
const balanceEl = document.getElementById("balance");
const priceEl = document.getElementById("price");
const historyEl = document.getElementById("history");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

/* ---------------- PLAN ---------------- */

function initPlan(){
  if(plan==="399"){ balance=1000000; }
  if(plan==="999"){ balance=10000000; }
}

/* ---------------- UI UPDATE ---------------- */

function updateUI(){
  planEl.innerText=plan;
  balanceEl.innerText="Balance: ₹"+balance.toFixed(2);
  priceEl.innerText="Price: "+price.toFixed(2);

  historyEl.innerHTML="";
  trades.slice().reverse().forEach(t=>{
    let div=document.createElement("div");
    div.innerText=`${t.type} | Entry:${t.entry} | Exit:${t.exit} | P/L: ₹${t.pl}`;
    historyEl.appendChild(div);
  });
}

/* ---------------- CHART ---------------- */

function drawChart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2;

  chartData.forEach((p, i) => {
    let x = i * 5;
    let y = canvas.height - p;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

/* ---------------- PRICE MOVEMENT ---------------- */

function movePrice(){
  price += (Math.random()-0.5)*2;

  chartData.push(price*1.5);
  if(chartData.length>60) chartData.shift();

  drawChart();
  checkTrade();
  updateUI();
}

setInterval(movePrice,1000);

/* ---------------- TRADING ---------------- */

function openTrade(type){
  if(balance<=0 && plan==="FREE") return alert("Balance Finished.");
  if(currentTrade) return alert("Trade running");

  let lot=parseFloat(document.getElementById("lot").value)||1;
  let sl=parseFloat(document.getElementById("sl").value);
  let target=parseFloat(document.getElementById("target").value);

  if(!sl||!target) return alert("Enter SL & Target");

  currentTrade={type,entry:price,lot,sl,target};
}

function checkTrade(){
  if(!currentTrade) return;

  let hit=false;
  let pl=0;

  if(currentTrade.type==="BUY"){
    if(price<=currentTrade.sl||price>=currentTrade.target){
      pl=(price-currentTrade.entry)*currentTrade.lot;
      hit=true;
    }
  }

  if(currentTrade.type==="SELL"){
    if(price>=currentTrade.sl||price<=currentTrade.target){
      pl=(currentTrade.entry-price)*currentTrade.lot;
      hit=true;
    }
  }

  if(hit){
    balance+=pl;

    trades.push({
      type:currentTrade.type,
      entry:currentTrade.entry.toFixed(2),
      exit:price.toFixed(2),
      pl:pl.toFixed(2)
    });

    localStorage.setItem("balance",balance);
    localStorage.setItem("trades",JSON.stringify(trades));
    currentTrade=null;
  }
}

/* ---------------- UPGRADE ---------------- */

function upgrade(type){
  plan=type.toString();
  localStorage.setItem("plan",plan);
  initPlan();
  localStorage.setItem("balance",balance);
  alert("Upgraded to ₹"+type+" Plan");
  updateUI();
}

/* ---------------- RESET ---------------- */

function resetBalance(){
  if(plan==="FREE") return alert("Premium Only");

  if(plan==="399") balance=1000000;
  if(plan==="999") balance=10000000;

  localStorage.setItem("balance",balance);
  alert("Balance Reset Done");
  updateUI();
}

/* ---------------- INVITE ---------------- */

function inviteReward(){
  balance+=1000;
  localStorage.setItem("balance",balance);
  alert("Invite Reward ₹1000 Added");
  updateUI();
}

/* ---------------- INIT ---------------- */

initPlan();
updateUI();
drawChart();
