// ===== Global Data =====
let salesData = JSON.parse(localStorage.getItem("salesData")) || {};
let debtors = JSON.parse(localStorage.getItem("debtors")) || {};
let currentDate = new Date().toISOString().split('T')[0]; // today's date

// ===== DOM Elements =====
const datePicker = document.getElementById("salesDate");
const salesTable = document.getElementById("salesTable");
const debtorTable = document.getElementById("debtorTable");
const addSaleBtn = document.getElementById("addSaleBtn");
const addDebtorBtn = document.getElementById("addDebtorBtn");

// ===== Initialize =====
datePicker.value = currentDate;
renderSales();
renderDebtors();
checkDueDebtors();

// ===== Event Listeners =====
datePicker.addEventListener("change", () => {
    currentDate = datePicker.value;
    renderSales();
});

addSaleBtn.addEventListener("click", () => {
    let item = prompt("Item name:");
    let cost = parseFloat(prompt("Purchase cost:")) || 0;
    let portionPrice = parseFloat(prompt("Portion price:")) || 0;

    if (!salesData[currentDate]) salesData[currentDate] = [];
    salesData[currentDate].push({
        item, cost, portionPrice, portionsSold: 0
    });

    saveData();
    renderSales();
});

addDebtorBtn.addEventListener("click", () => {
    let name = prompt("Debtor name:");
    let item = prompt("Item taken:");
    let amount = parseFloat(prompt("Amount owed:")) || 0;
    let dueDate = prompt("Due date (YYYY-MM-DD):");

    let id = Date.now();
    debtors[id] = { name, item, amount, dueDate, dateTaken: currentDate };

    saveData();
    renderDebtors();
    scheduleNotification(name, dueDate);
});

// ===== Render Sales =====
function renderSales() {
    salesTable.innerHTML = "";

    let daySales = salesData[currentDate] || [];
    daySales.forEach((sale, index) => {
        let row = document.createElement("tr");
        let profit = (sale.portionsSold * sale.portionPrice) - sale.cost;

        row.innerHTML = `
            <td>${sale.item}</td>
            <td>${sale.cost}</td>
            <td>${sale.portionPrice}</td>
            <td>${sale.portionsSold}</td>
            <td>${profit}</td>
            <td>
                <button onclick="changePortion('${currentDate}', ${index}, 1)">+1</button>
                <button onclick="changePortion('${currentDate}', ${index}, -1)">-1</button>
            </td>
        `;
        salesTable.appendChild(row);
    });
}

// ===== Render Debtors =====
function renderDebtors() {
    debtorTable.innerHTML = "";
    for (let id in debtors) {
        let d = debtors[id];
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${d.name}</td>
            <td>${d.item}</td>
            <td>${d.amount}</td>
            <td>${d.dateTaken}</td>
            <td>${d.dueDate}</td>
        `;
        debtorTable.appendChild(row);
    }
}

// ===== Change Portions Sold =====
function changePortion(date, index, amount) {
    salesData[date][index].portionsSold += amount;
    if (salesData[date][index].portionsSold < 0) {
        salesData[date][index].portionsSold = 0;
    }
    saveData();
    renderSales();
}

// ===== Save to Local Storage =====
function saveData() {
    localStorage.setItem("salesData", JSON.stringify(salesData));
    localStorage.setItem("debtors", JSON.stringify(debtors));
}

// ===== Check Due Debtors =====
function checkDueDebtors() {
    let today = new Date().toISOString().split('T')[0];
    for (let id in debtors) {
        if (debtors[id].dueDate === today) {
            alert(`Debtor ${debtors[id].name} payment is due today!`);
        }
    }
}

// ===== Notification API =====
function scheduleNotification(name, dueDate) {
    if (!("Notification" in window)) return;

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            let dueTime = new Date(dueDate).getTime() - Date.now();
            if (dueTime > 0) {
                setTimeout(() => {
                    new Notification(`Payment due for ${name}`, {
                        body: "Please collect the debtor's payment."
                    });
                }, dueTime);
            }
        }
    });
}
