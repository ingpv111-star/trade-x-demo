/********************************************************
 FUTURE READY TRADING STRUCTURE
 MarketEngine
 TradeEngine
 RiskEngine
 UI Engine
*********************************************************/

let plan = localStorage.getItem("plan") || "FREE";
let balance = parseFloat(localStorage.getItem("balance")) || 10000;

const planEl = document.getElementById("planType");
const balanceEl = document.getElementById("balance");
const priceEl = document.getElementById("price");
const historyEl = document.getElementById("history");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

/* ===========================
   INDEX SELECTOR (C)
=========================== */

let selectedIndex = "NIFTY";

const indexSettings = {
  NIFTY: { base: 18000, volatility: 10 },
  BANKNIFTY: { base: 42000, volatility: 25 },
  FINNIFTY: { base: 20000, volatility: 15 }
};

/* ===========================
   MARKET ENGINE
=========================== */

class MarketEngine {
  constructor() {
    this.price = indexSettings[selectedIndex].base;
  }

  tick() {
    let vol = indexSettings[selectedIndex].volatility;
    this.price += (Math.random() - 0.5) * vol;
    return this.price;
  }

  getPrice() {
    return this.price;
  }
}

const market = new MarketEngine();

/* ===========================
   TRADE ENGINE
=========================== */

class TradeEngine {
  constructor() {
    this.currentTrade = null;
  }

  open(type, sl, target) {
    if (this.currentTrade) return alert("Trade already running");

    this.currentTrade = {
      type,
      entry: market.getPrice(),
      sl,
      target
    };
  }

  check() {
    if (!this.currentTrade) return;

    let price = market.getPrice();
    let trade = this.currentTrade;

    let hit = false;
    let pl = 0;

    if (trade.type === "BUY") {
      pl = price - trade.entry;
      if (price <= trade.sl || price >= trade.target) hit = true;
    }

    if (trade.type === "SELL") {
      pl = trade.entry - price;
      if (price >= trade.sl || price <= trade.target) hit = true;
    }

    showLivePL(pl);

    if (hit) {
      balance += pl;
      addHistory(trade.type, trade.entry, price, pl);
      this.currentTrade = null;
    }
  }
}

const trader = new TradeEngine();

/* ===========================
   RISK ENGINE
=========================== */

class RiskEngine {
  static canTrade() {
    if (plan === "FREE" && balance <= 0) {
      alert("Upgrade Required");
      return false;
    }
    return true;
  }
}

/* ===========================
   UI ENGINE
=========================== */

let candles = [];
let tickCount = 0;
let currentCandle = null;

function drawGrid() {
  ctx.strokeStyle = "#1e293b";
  for (let i = 0; i < canvas.height; i += 30) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
}

function drawCandles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  if (candles.length === 0) return;

  let max = Math.max(...candles.map(c => c.high));
  let min = Math.min(...candles.map(c => c.low));
  let range = max - min || 1;

  candles.forEach((c, i) => {
    let x = i * 8 + 10;

    let openY = canvas.height - ((c.open - min) / range) * canvas.height;
    let closeY = canvas.height - ((c.close - min) / range) * canvas.height;
    let highY = canvas.height - ((c.high - min) / range) * canvas.height;
    let lowY = canvas.height - ((c.low - min) / range) * canvas.height;

    ctx.strokeStyle = "#aaa";
    ctx.beginPath();
    ctx.moveTo(x, highY);
    ctx.lineTo(x, lowY);
    ctx.stroke();

    ctx.fillStyle = c.close > c.open ? "#22c55e" : "#ef4444";

    ctx.fillRect(
      x - 3,
      Math.min(openY, closeY),
      6,
      Math.abs(closeY - openY) || 2
    );
  });
}

function showLivePL(pl) {
  if (!trader.currentTrade) return;

  priceEl.innerText =
    "Price: " +
    market.getPrice().toFixed(2) +
    " | Live P/L: ₹" +
    pl.toFixed(2);
}

function addHistory(type, entry, exit, pl) {
  let div = document.createElement("div");
  div.innerText =
    type +
    " | Entry: " +
    entry.toFixed(2) +
    " | Exit: " +
    exit.toFixed(2) +
    " | P/L: ₹" +
    pl.toFixed(2);
  historyEl.prepend(div);
}

function updateBalance() {
  balanceEl.innerText = "Balance: ₹" + balance.toFixed(2);
  planEl.innerText = plan;
}

/* ===========================
   MAIN LOOP
=========================== */

function mainLoop() {
  let price = market.tick();
  tickCount++;

  if (!currentCandle) {
    currentCandle = {
      open: price,
      high: price,
      low: price,
      close: price
    };
  }

  currentCandle.high = Math.max(currentCandle.high, price);
  currentCandle.low = Math.min(currentCandle.low, price);
  currentCandle.close = price;

  if (tickCount % 5 === 0) {
    candles.push(currentCandle);
    if (candles.length > 40) candles.shift();
    currentCandle = null;
  }

  trader.check();
  drawCandles();
  updateBalance();
}

setInterval(mainLoop, 1000);

/* ===========================
   BUTTON FUNCTIONS
=========================== */

function openTrade(type) {
  if (!RiskEngine.canTrade()) return;

  let sl = parseFloat(document.getElementById("sl").value);
  let target = parseFloat(document.getElementById("target").value);

  if (!sl || !target) return alert("Enter SL & Target");

  trader.open(type, sl, target);
}

function upgrade(type) {
  plan = type.toString();
  localStorage.setItem("plan", plan);

  if (plan === "399") balance = 1000000;
  if (plan === "999") balance = 10000000;

  localStorage.setItem("balance", balance);
  updateBalance();
  alert("Upgraded");
}

function resetBalance() {
  if (plan === "FREE") return alert("Premium Only");

  if (plan === "399") balance = 1000000;
  if (plan === "999") balance = 10000000;

  updateBalance();
}

updateBalance();
