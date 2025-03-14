const menuForm = document.getElementById("menuForm");
const menuItemsTable = document.getElementById("menuItems");

let menuItems = [];
let category = ["fast-food", "dessert", "chinese"];

// Load saved items when page loads
document.addEventListener("DOMContentLoaded", function () {
  // e.preventDefault();
  const savedItems = localStorage.getItem("menuItems");
  if (savedItems) {
    menuItems = JSON.parse(savedItems);
    displayMenuItems();
  }
});

menuForm.addEventListener("submit", function (e) {
  e.preventDefault();
  addItem();
});
function addItem() {
  const name = menuForm.querySelector('input[type="text"]').value;
  const description = menuForm.querySelector("textarea").value;
  const price = menuForm.querySelector('input[type="number"]').value;
  const category = menuForm.querySelector("select").value;
  const imageFile = menuForm.querySelector('input[type="file"]').files[0];

  const imageUrl = imageFile ? URL.createObjectURL(imageFile) : "";

  const menuItem = {
    name,
    description,
    price,
    category,
    imageUrl,
  };

  menuItems.push(menuItem);

  // Add this line to save to localStorage
  localStorage.setItem("menuItems", JSON.stringify(menuItems));

  displayMenuItems();

  menuForm.reset();
}
function displaytotalItems() {
  const totalItems = menuItems.length;
  document.getElementById("totalItems").textContent = totalItems;
}
function displaytotalCategories() {
  const totalcategory = category.length;
  document.getElementById("totalcategory").textContent = totalcategory;
}

function displayMenuItems() {
  menuItemsTable.innerHTML = ""; // Clear current items

  menuItems.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><img src="${item.imageUrl}" alt="${
      item.name
    }" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td>${item.category}</td>
                    <td>$${item.price}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="edit(${index})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteItem(${index})">Delete</button>
                    </td>
                `;
    menuItemsTable.appendChild(row);
  });
  displaytotalItems();
  displaytotalCategories();
}

// Function to delete item
function deleteItem(index) {
  menuItems.splice(index, 1);
  // Add this line to update localStorage
  localStorage.setItem("menuItems", JSON.stringify(menuItems));
  displayMenuItems();
}

// Function to edit item
function editItem(index) {
  const item = menuItems[index];

  // Fill form with item data
  menuForm.querySelector('input[type="text"]').value = item.name;
  menuForm.querySelector("textarea").value = item.description;
  menuForm.querySelector('input[type="number"]').value = item.price;
  menuForm.querySelector("select").value = item.category;

  // Remove item from array
  menuItems.splice(index, 1);
  // Add this line to update localStorage
  localStorage.setItem("menuItems", JSON.stringify(menuItems));
  displayMenuItems();
}
function edit(index) {
  window.location.href = "fooditems.html";
  editItem(index);
}
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("/menuitem"); // Call backend API
    if (!response.ok) {
      throw new Error("Failed to fetch menu items");
    }

    const menuItems = await response.json(); // Convert response to JSON
    displayMenuItems(menuItems); // Function to display items
  } catch (error) {
    console.error("Error fetching menu:", error);
  }
});

// Function to display menu items in HTML
function displayMenuItems(menuItems) {
  const menuContainer = document.getElementById("menuItems"); // Get container

  menuContainer.innerHTML = ""; // Clear existing content

  menuItems.forEach((item, index) => {
    const row = document.createElement("tr"); // Create table row
    row.innerHTML = `
      <td>${index + 1}</td>
      <td><img src="${item.imageUrl}" alt="${
      item.name
    }" style="width: 50px; height: 50px;"></td>
      <td>${item.name}</td>
      <td>${item.description}</td>
      <td>${item.category}</td>
      <td>$${item.price}</td>
    `;
    menuContainer.appendChild(row);
  });
}
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/total-items"); 
    if (!response.ok) throw new Error("Failed to fetch total items");
    const data = await response.json();
   
    
    document.getElementById("totalItems").textContent = data.total;
  } catch (error) {
    console.error("Error fetching total items:", error);
    document.getElementById("totalItems").textContent = "Error!";
  }
});
async function fetchTotalItems() {
  try {
    const response = await fetch("http://localhost:3001/total-items");
    const data = await response.json();
    document.getElementById("totalItems").textContent = data.total;
  } catch (error) {
    console.error("Error fetching total items:", error);
    document.getElementById("totalItems").textContent = "Error loading data";
  }
}

fetchTotalItems();
