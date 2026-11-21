const FINNHUB_KEY = "dc0kejpr01qs4ks4i750dc0kejpr01qs4ks4i75g";
const FINNHUB_SYMBOL = "STNE";
const FINNHUB_INTERVAL = 15000;

let cash = (Math.random() * 40) + 10;
let students = Math.floor(Math.random() * 100) + 1;
let hasWon = false;
let currentAction = "";

let items = ["BROOM", "WANDS", "MANDRAKE", "POTIONS", "QUIDDITCH", "DRAGONHIDE", "FLOO", "QUILLS", "OWL", "STONE"];

let prices = { BROOM: 18, WANDS: 12, MANDRAKE: 8, POTIONS: 10, QUIDDITCH: 22, DRAGONHIDE: 16, FLOO: 7, QUILLS: 9, OWL: 6, STONE: 30 };
let owned  = { BROOM: 0, WANDS: 0, MANDRAKE: 0, POTIONS: 0, QUIDDITCH: 0, DRAGONHIDE: 0, FLOO: 0, QUILLS: 0, OWL: 0, STONE: 0 };
let prev   = { BROOM: 18, WANDS: 12, MANDRAKE: 8, POTIONS: 10, QUIDDITCH: 22, DRAGONHIDE: 16, FLOO: 7, QUILLS: 9, OWL: 6, STONE: 30 };

const wizardingGoods = {
    BROOM: "Nimbus school broom", WANDS: "Wand cores",
    MANDRAKE: "Mandrake roots", POTIONS: "Potion ingredients",
    QUIDDITCH: "Quidditch robes", DRAGONHIDE: "Dragon-hide gloves",
    FLOO: "Floo powder tins", QUILLS: "Enchanted quills",
    OWL: "Owl post treats", STONE: "StoneCo Ltd (STNE) — Philosopher's Stone replica"
};

async function fetchStonePrice() {
    try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${FINNHUB_SYMBOL}&token=${FINNHUB_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Finnhub ${res.status}`);
        const data = await res.json();
        if (typeof data.c === "number" && data.c > 0) {
            const newPrice = Number(data.c.toFixed(2));
            if (newPrice !== prices.STONE) {
                prev.STONE = prices.STONE;
                prices.STONE = newPrice;
                draw();
            }
        }
    } catch (e) {
        console.warn("Finnhub fetch failed:", e.message);
    }
}
fetchStonePrice();
setInterval(fetchStonePrice, FINNHUB_INTERVAL);

function minus(sym) {
    let box = document.getElementById("qty-" + sym);
    box.value = Math.max(1, Number(box.value) - 1);
}

function plus(sym) {
    let box = document.getElementById("qty-" + sym);
    box.value = Number(box.value) + 1;
}

function max(sym) {
    let box = document.getElementById("qty-" + sym);
    if (owned[sym] > 0) box.value = owned[sym];
    else box.value = Math.max(1, Math.floor(cash / prices[sym]));
}

function show(sym, action) {
    currentAction = action;
    document.getElementById("buttons-" + sym).style.display = "none";
    document.getElementById("controls-" + sym).style.display = "flex";
    document.getElementById("qty-" + sym).value = 1;
}

function hide(sym) {
    document.getElementById("buttons-" + sym).style.display = "flex";
    document.getElementById("controls-" + sym).style.display = "none";
}

function execute(sym) {
    let amount = Number(document.getElementById("qty-" + sym).value);
    if (currentAction === "buy") {
        let totalCost = prices[sym] * amount;
        if (cash >= totalCost) {
            cash -= totalCost;
            owned[sym] += amount;
            prev[sym] = prices[sym];
            if (sym === "STONE" && !hasWon) {
                setTimeout(() => {
                    hasWon = true;
                    alert("🏆 You bought the Philosopher's Stone (StoneCo Ltd) and became the richest trader in Hogsmeade!");
                }, 100);
            }
        } else alert("Not enough Galleons!");
    } else if (currentAction === "sell") {
        if (owned[sym] >= amount) {
            owned[sym] -= amount;
            cash += prices[sym] * amount;
            prev[sym] = prices[sym];
        } else alert("Not enough items!");
    }
    hide(sym);
    draw();
}

function draw() {
    document.getElementById("cash").innerText = "G " + cash.toFixed(2);
    document.getElementById("students").innerText = students;
    let totalOwned = 0, totalWorth = cash;
    for (let sym of items) {
        let price = prices[sym], diff = price - prev[sym];
        let percent = prev[sym] > 0 ? (diff / prev[sym]) * 100 : 0;
        let pxBox = document.getElementById("px-" + sym);
        pxBox.innerText = "G " + price.toFixed(2);
        pxBox.className = "px" + (diff > 0.001 ? " up" : (diff < -0.001 ? " down" : ""));
        let chgBox = document.getElementById("chg-" + sym);
        if (diff > 0.001) {
            chgBox.innerText = "+" + diff.toFixed(2) + " (+" + percent.toFixed(1) + "%)";
            chgBox.className = "chg up";
        } else if (diff < -0.001) {
            chgBox.innerText = diff.toFixed(2) + " (" + percent.toFixed(1) + "%)";
            chgBox.className = "chg down";
        } else {
            chgBox.innerText = "0.00";
            chgBox.className = "chg flat";
        }
        document.getElementById("own-" + sym).innerText = owned[sym];
        totalOwned += owned[sym];
        totalWorth += owned[sym] * price;
    }
    document.getElementById("holdings").innerText = totalOwned;
    document.getElementById("netWorth").innerText = "G " + totalWorth.toFixed(2);
}

setInterval(() => {
    for (let sym of items) {
        if (sym === "STONE") continue;
        let randomChange = (Math.random() * 1) - 0.5;
        let multiplier = Math.max(0.2, students / 50);
        prices[sym] = Math.max(1, prices[sym] + randomChange * multiplier);
    }
    students = Math.min(100, Math.max(1, students + Math.floor(Math.random() * 9) - 4));
    draw();
}, 2000);

setInterval(() => {
    let candidates = items.filter(s => s !== "STONE");
    let sym = candidates[Math.floor(Math.random() * candidates.length)];
    let isGoingUp = Math.random() > 0.5;
    let percent = Math.floor(Math.random() * 26) + 25;
    let text = isGoingUp
        ? "📈 " + wizardingGoods[sym] + " prices are rising! Hogwarts students are buying before supplies run out. 📈 | "
        : "📉 " + wizardingGoods[sym] + " prices dropped as students sell. 📉 | ";
    prices[sym] = Math.max(1, prices[sym] * (1 + (isGoingUp ? 1 : -1) * percent / 100));
    let randomTips = [
        "🏰 Hogsmeade is busy after classes! 🏰 | ", "🪙 Check your Galleons before trading! 🪙 | ",
        "🧹 Quidditch practice is starting soon! 🧹 | ", "🧪 Potions homework has everyone shopping! 🧪 | ",
        "🏆 Who has the biggest vault today? 🏆 | ", "🦉 Owl Post has delivered a new rumour! 🦉 | ",
        "📚 The library is full of spell researchers! 📚 | ", "✨ A new charm is trending in the castle! ✨ | ",
        "🧙 The shopkeepers are opening their stalls! 🧙 | ", "💎 StoneCo (STNE) moves the Stone's price live! 💎 | ",
        "📉 Prices are falling—time to bargain! 📉 | ", "📈 Demand is rising across Hogsmeade! 📈 | ",
        "🤝 Trade carefully; the market remembers! 🤝 | ", "⏰ The Hogwarts Express leaves soon! ⏰ | ",
        "🪄 New enchanted goods have arrived! 🪄 | "
    ];
    let tip1 = randomTips[Math.floor(Math.random() * randomTips.length)];
    let tip2 = randomTips[Math.floor(Math.random() * randomTips.length)];
    document.getElementById("ticker-text").innerText = text + tip1 + tip2 + "🚨 BREAKING: HOGSMEADE MARKET IS OPEN! 🚨 |";
    draw();
}, 25000);

draw();