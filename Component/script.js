
// Get DOM elements
const loginForm = document.getElementById('loginForm');
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');

// Handle login form submission
loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    navdash();
});
function navdash(){
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    // Basic validation (you should replace this with proper authentication)
    if (email && password) {
        // Hide login section and show dashboard
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
    }
}

        
        
        const menuForm = document.getElementById('menuForm');
        const menuItemsTable = document.getElementById('menuItems');

        let menuItems = [];

    
        menuForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addItem();
          
            
        });
        function addItem(){
            const name = menuForm.querySelector('input[type="text"]').value;
            const description = menuForm.querySelector('textarea').value;
            const price = menuForm.querySelector('input[type="number"]').value;
            const imageFile = menuForm.querySelector('input[type="file"]').files[0];

  
            const imageUrl = imageFile ? URL.createObjectURL(imageFile) : '';

       
            const menuItem = {
                name,
                description,
                price,
                imageUrl
            };

       
            menuItems.push(menuItem);

         
            displayMenuItems();

      
            menuForm.reset();
        }


        function displayMenuItems() {
            menuItemsTable.innerHTML = ''; // Clear current items

            menuItems.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${item.imageUrl}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td>$${item.price}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editItem(${index})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteItem(${index})">Delete</button>
                    </td>
                `;
                menuItemsTable.appendChild(row);
            });
        }

        // Function to delete item
        function deleteItem(index) {
            menuItems.splice(index, 1);
            displayMenuItems();
        }

        // Function to edit item
        function editItem(index) {
            const item = menuItems[index];
            
            // Fill form with item data
            menuForm.querySelector('input[type="text"]').value = item.name;
            menuForm.querySelector('textarea').value = item.description;
            menuForm.querySelector('input[type="number"]').value = item.price;

            // Remove item from array
            menuItems.splice(index, 1);
            displayMenuItems();
        }
