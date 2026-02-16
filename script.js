let plan = localStorage.getItem("plan") || "FREE";
let balance = parseFloat(localStorage.getItem("balance")) || 10000;
let price = 100;
let trades = [];
let currentTrade = null;

let candles = [];

const planEl = document.getElementById("planType");
const balanceEl = document.getElementById("balance");
const priceEl = document.getElementById("price");
const historyEl = document.getElementById("history");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

/* -------- PLAN -------- */

function initPlan(){
  if(plan==="399"){ balance=1000000; }
  if(plan==="999"){ balance=10000000; }
}

/* -------- UI -------- */

function updateUI(){
  planEl.innerText = plan;
  balanceEl.innerText = "Balance: ₹" + balance.toFixed(2);
  priceEl.innerText = "Price: " + price.toFixed(2);
}

/* -------- GRID -------- */

function drawGrid(){
  ctx.strokeStyle="#1e293b";
  ctx.lineWidth=1;

  for(let i=0;i<canvas.height;i+=30){
    ctx.beginPath();
    ctx.moveTo(0,i);
    ctx.lineTo(canvas.width,i);
    ctx.stroke();
  }

  for(let i=0;i<canvas.width;i+=50){
    ctx.beginPath();
    ctx.moveTo(i,0);
    ctx.lineTo(i,canvas.height);
    ctx.stroke();
  }
}

/* -------- CANDLE DRAW -------- */

function drawCandles(){

  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawGrid();

  if(candles.length===0) return;

  let max = Math.max(...candles.map(c=>c.high));
  let min = Math.min(...candles.map(c=>c.low));
  let range = max-min || 1;

  let candleWidth = 6;

  candles.forEach((c,i)=>{

    let x = i*10 + 10;

    let openY  = canvas.height - ((c.open-min)/range)*canvas.height;
    let closeY = canvas.height - ((c.close-min)/range)*canvas.height;
    let highY  = canvas.height - ((c.high-min)/range)*canvas.height;
    let lowY   = canvas.height - ((c.low-min)/range)*canvas.height;

    ctx.strokeStyle="#aaa";
    ctx.beginPath();
    ctx.moveTo(x,highY);
    ctx.lineTo(x,lowY);
    ctx.stroke();

    ctx.fillStyle = c.close>c.open ? "#22c55e" : "#ef4444";

    ctx.fillRect(
      x-candleWidth/2,
      Math.min(openY,closeY),
      candleWidth,
      Math.abs(closeY-openY)||2
    );
  });
}

/* -------- PRICE SIMULATION -------- */

let tick=0;
let currentCandle = null;

function movePrice(){

  price += (Math.random()-0.5)*2;
  tick++;

  if(!currentCandle){
    currentCandle={
      open:price,
      high:price,
      low:price,
      close:price
    };
  }

  currentCandle.high = Math.max(currentCandle.high,price);
  currentCandle.low  = Math.min(currentCandle.low,price);
  currentCandle.close=price;

  if(tick%5===0){
    candles.push(currentCandle);
    if(candles.length>40) candles.shift();
    currentCandle=null;
  }

  drawCandles();
  updateUI();
}

setInterval(movePrice,1000);

/* -------- TRADING -------- */

function openTrade(type){
  if(balance<=0 && plan==="FREE") return alert("Balance Finished");
  if(currentTrade) return alert("Trade running");

  currentTrade={type,entry:price};

  drawTradeMarker(type);
}

function drawTradeMarker(type){

  ctx.fillStyle= type==="BUY" ? "#22c55e" : "#ef4444";

  ctx.beginPath();
  ctx.arc(canvas.width-20,20,6,0,Math.PI*2);
  ctx.fill();
}

/* -------- UPGRADE -------- */

function upgrade(type){
  plan=type.toString();
  localStorage.setItem("plan",plan);
  initPlan();
  localStorage.setItem("balance",balance);
  alert("Upgraded to ₹"+type);
  updateUI();
}

function resetBalance(){
  if(plan==="FREE") return alert("Premium Only");

  if(plan==="399") balance=1000000;
  if(plan==="999") balance=10000000;

  localStorage.setItem("balance",balance);
  updateUI();
}

/* -------- START -------- */

initPlan();
updateUI();
