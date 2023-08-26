const socket = io();

function findRowByProductId(productId) {
    const productTable = document.getElementById("product-table").getElementsByTagName("tbody")[0];
    for (let i = 0; i < productTable.rows.length; i++) {
        const row = productTable.rows[i];
        const cell = row.cells[0]; // Suponiendo que el ID del producto está en la primera celda
        console.log("Checking cell content:", cell.innerHTML);
        if (cell.innerHTML.trim()  === productId) {
            console.log("Row found for product ID:", productId);
            return row;
        }
    }
    console.log("Row not found for product ID:", productId);
    return null; // Si no se encuentra la fila
}


async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const responseData = await response.json();
        console.log("Products received:", responseData);

        const products = responseData.payload; // Accede al array de productos
        const productTable = document.getElementById("product-table").getElementsByTagName("tbody")[0];
        productTable.innerHTML = '';

        products.forEach((product) => {
            const newRow = productTable.insertRow();
            const nameCell = newRow.insertCell(0);
            nameCell.innerHTML = product.title;
            const stockCell = newRow.insertCell(1);
            stockCell.innerHTML = product.stock;
        });

        socket.on("productAdded", (product) => {
            console.log("Product added:", product.title);
            const newRow = productTable.insertRow();
            const nameCell = newRow.insertCell(0);
            nameCell.innerHTML = product.title;
            const stockCell = newRow.insertCell(1);
            stockCell.innerHTML = product.stock; 
        });

        socket.on("productDeleted", (deletedProductId) => {
            const rowToDelete = findRowByProductId(deletedProductId);
            if (rowToDelete) {
                rowToDelete.remove();
            }
        });        
        
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
}

// Cargar los productos al cargar la página
window.addEventListener('load', loadProducts);
