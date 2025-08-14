// ======================= DATA STORAGE ===========================
let salesData = JSON.parse(localStorage.getItem("salesData")) || {};
let debtors = JSON.parse(localStorage.getItem("debtors")) || [];

// ======================= SAVE FUNCTIONS =========================
function saveData() {
    localStorage.setItem("salesData", JSON.stringify(salesData));
    localStorage.setItem("debtors", JSON.stringify(debtors));
}

// ======================= CALENDAR SELECT ========================
function changeDate(date) {
    if (!salesData[date]) {
        salesData[date] = { items: [], totalProfit: 0 };
    }
    renderItems(date);
    renderDebtors();
}

document.getElementById("datePicker").addEventListener("change", e => {
    changeDate(e.target.value);
});

let today = new Date().toISOString().split("T")[0];
document.getElementById("datePicker").value = today;
changeDate(today);

// ======================= ADD ITEM ===============================
function addItem() {
    let date = document.getElementById("datePicker").value;
    let name = prompt("Enter item name:");
    let cost = parseFloat(prompt("Enter cost price:"));
    let portionPrice = parseFloat(prompt("Enter portion price:"));

    if (!name || isNaN(cost) || isNaN(portionPrice)) return;

    salesData[date].items.push({
        name,
        cost,
        portionPrice,
        purchasedPortions: 0,
        profit: -cost
    });

    saveData();
    renderItems(date);
}

// ======================= SELL PORTION ===========================
function sellPortion(date, index, change) {
    let item = salesData[date].items[index];
    item.purchasedPortions += change;

    let revenue = change * item.portionPrice;
    item.profit += revenue;

    saveData();
    renderItems(date);
}

// ======================= DELETE ITEM ============================
function deleteItem(date, index) {
    if (confirm("Delete this item?")) {
        salesData[date].items.splice(index, 1);
        saveData();
        renderItems(date);
    }
}

// ======================= RENDER ITEMS ===========================
function renderItems(date) {
    let tbody = document.getElementById("itemsTable");
    tbody.innerHTML = "";
    salesData[date].items.forEach((item, i) => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.cost}</td>
            <td>${item.portionPrice}</td>
            <td>${item.purchasedPortions}</td>
            <td>${item.profit}</td>
            <td>
                <button onclick="sellPortion('${date}', ${i}, 1)">+1</button>
                <button onclick="sellPortion('${date}', ${i}, -1)">-1</button>
                <button onclick="deleteItem('${date}', ${i})">❌</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ======================= ADD DEBTOR =============================
function addDebtor() {
    let name = prompt("Debtor name:");
    let amount = parseFloat(prompt("Amount owed:"));
    let dueDate = prompt("Due date (YYYY-MM-DD):");

    if (!name || isNaN(amount) || !dueDate) return;

    let now = new Date();
    debtors.push({
        name,
        amount,
        dateTaken: now.toLocaleString(),
        dueDate
    });

    saveData();
    renderDebtors();
}

// ======================= RENDER DEBTORS =========================
function renderDebtors() {
    let tbody = document.getElementById("debtorsTable");
    tbody.innerHTML = "";
    debtors.forEach((debtor, i) => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${debtor.name}</td>
            <td>${debtor.amount}</td>
            <td>${debtor.dateTaken}</td>
            <td>${debtor.dueDate}</td>
            <td><button onclick="removeDebtor(${i})">❌</button></td>
        `;
        tbody.appendChild(tr);
    });
    checkDebtorNotifications();
}

// ======================= REMOVE DEBTOR ==========================
function removeDebtor(index) {
    debtors.splice(index, 1);
    saveData();
    renderDebtors();
}

// ======================= NOTIFICATIONS ==========================
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission();
    }
}

function checkDebtorNotifications() {
    if (Notification.permission === "granted") {
        let today = new Date().toISOString().split("T")[0];
        debtors.forEach(d => {
            if (d.dueDate === today) {
                new Notification(`Debtor Due: ${d.name}`, {
                    body: `Owes ₦${d.amount} - Due today!`
                });
            }
        });
    }
}

// ======================= BACKUP/RESTORE =========================
function exportData() {
    let dataStr = JSON.stringify({ salesData, debtors });
    let blob = new Blob([dataStr], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "sales_backup.json";
    a.click();
}

function importData(event) {
    let file = event.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = e => {
        let data = JSON.parse(e.target.result);
        salesData = data.salesData || {};
        debtors = data.debtors || [];
        saveData();
        renderItems(today);
        renderDebtors();
    };
    reader.readAsText(file);
}
