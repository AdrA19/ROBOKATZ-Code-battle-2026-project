let cash = (Math.random() * 40) + 10;
let students = Math.floor(Math.random() * 100) + 1;
let hasWon = false;
let currentAction = "";
let items = ["PIZZA", "BURGER", "SALAD", "JUICE", "SANDWICH", "HOTDOG", "WATER", "FRIES", "DONUT", "APPLE"];
let prices = { PIZZA: 5, BURGER: 4, SALAD: 2, JUICE: 3, SANDWICH: 6, HOTDOG: 3.5, WATER: 1, FRIES: 2.5, DONUT: 2, APPLE: 0 };
let owned = { PIZZA: 0, BURGER: 0, SALAD: 0, JUICE: 0, SANDWICH: 0, HOTDOG: 0, WATER: 0, FRIES: 0, DONUT: 0, APPLE: 0 };
let prev = { PIZZA: 5, BURGER: 4, SALAD: 2, JUICE: 3, SANDWICH: 6, HOTDOG: 3.5, WATER: 1, FRIES: 2.5, DONUT: 2, APPLE: 0 };

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
            if (sym === "APPLE" && !hasWon) {
                setTimeout(() => { hasWon = true; alert("🏆 YOU WIN! You bought AAPL stock and became the ultimate trader! Even John Ternus would be proud! 🏆"); }, 100);
            }
        } else alert("Not enough cash!");
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
    document.getElementById("cash").innerText = "AED " + cash.toFixed(2);
    document.getElementById("students").innerText = students;
    let totalOwned = 0, totalWorth = cash;
    for (let sym of items) {
        let price = prices[sym], diff = price - prev[sym];
        let percent = prev[sym] > 0 ? (diff / prev[sym]) * 100 : 0;
        let pxBox = document.getElementById("px-" + sym);
        pxBox.innerText = "AED " + price.toFixed(2);
        pxBox.className = "px" + (diff > 0.001 ? " up" : (diff < -0.001 ? " down" : ""));
        let chgBox = document.getElementById("chg-" + sym);
        if (diff > 0.001) { chgBox.innerText = "+" + diff.toFixed(2) + " (+" + percent.toFixed(1) + "%)"; chgBox.className = "chg up"; }
        else if (diff < -0.001) { chgBox.innerText = diff.toFixed(2) + " (" + percent.toFixed(1) + "%)"; chgBox.className = "chg down"; }
        else { chgBox.innerText = "0.00"; chgBox.className = "chg flat"; }
        document.getElementById("own-" + sym).innerText = owned[sym];
        totalOwned += owned[sym];
        totalWorth += owned[sym] * price;
    }
    document.getElementById("holdings").innerText = totalOwned;
    document.getElementById("netWorth").innerText = "AED " + totalWorth.toFixed(2);
}

async function getAppleStock() {
    try {
        let response = await fetch("https://finnhub.io/api/v1/quote?symbol=AAPL&token=dbqmjk1r01qn88eghfsgdbqmjk1r01qn88eghft0");
        let data = await response.json();
        if (data.c && data.c > 0) { prev.APPLE = prices.APPLE; prices.APPLE = data.c; draw(); }
    } catch (error) {
        if (prices.APPLE === 0) { prices.APPLE = 180; prev.APPLE = 180; draw(); }
    }
}

setInterval(() => {
    for (let sym of items) {
        if (sym === "APPLE") continue;
        let randomChange = (Math.random() * 1) - 0.5;
        let multiplier = Math.max(0.2, students / 50);
        prices[sym] = Math.max(1, prices[sym] + randomChange * multiplier);
    }
    students = Math.min(100, Math.max(1, students + Math.floor(Math.random() * 9) - 4));
    draw();
}, 2000);

setInterval(() => {
    let sym = items[Math.floor(Math.random() * (items.length - 1))];
    let isGoingUp = Math.random() > 0.5;
    let percent = Math.floor(Math.random() * 26) + 25;
    let text = isGoingUp
        ? "📈 " + sym + " prices are rising! Students are buying before it runs out. 📈 | "
        : "📉 " + sym + " prices dropped. Students are selling because they aren't hungry. 📉 | ";
    prices[sym] = Math.max(1, prices[sym] * (1 + (isGoingUp ? 1 : -1) * percent / 100));
    let randomTips = [
        "🏫 The cafeteria is getting crowded! 🏫 | ", "🎒 Remember to check your allowance! 🎒 | ",
        "🍕 The kitchen is making a fresh batch! 🍕 | ", "🥗 Eating healthy today? 🥗 | ",
        "🏆 Who will have the highest net worth? 🏆 | ", "📚 Don't forget to do your homework after lunch! 📚 | ",
        "🏃‍♂️ The lunch bell is about to ring! 🏃‍♂️ | ", "💧 Stay hydrated during class! 💧 | ",
        "🧑‍🍳 The lunch ladies are working hard today! 🧑‍🍳 | ", "🍎 Buy AAPL stock to become the ultimate trader! 🍎 | ",
        "📉 Prices are dropping, grab a snack! 📉 | ", "📈 Demand is high, buy before it's gone! 📈 | ",
        "🤝 Split your allowance with a friend! 🤝 | ", "⏰ Only a few minutes left of break! ⏰ | ",
        "🥪 The sandwiches are looking fresh today! 🥪 | "
    ];
    let tip1 = randomTips[Math.floor(Math.random() * randomTips.length)];
    let tip2 = randomTips[Math.floor(Math.random() * randomTips.length)];
    document.getElementById("ticker-text").innerText = text + tip1 + tip2 + "🚨 BREAKING: DPSA Canteen Stock Exchange is OPEN! 🚨 |";
    draw();
}, 25000);

getAppleStock();
draw();