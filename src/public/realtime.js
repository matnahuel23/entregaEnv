const socket = io();

// Función para cargar y mostrar todos los productos en la tabla
async function loadProducts() {
        try {
        const response = await fetch('/api/products');
        const products = await response.json();
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
            const productTable = document.getElementById("product-table").getElementsByTagName("tbody")[0];
            const newRow = productTable.insertRow();
            const nameCell = newRow.insertCell(0);
            nameCell.innerHTML = product.title;
            const stockCell = newRow.insertCell(1);
            stockCell.innerHTML = product.stock; 
        })
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
}

// Cargar los productos al cargar la página
window.addEventListener('load', loadProducts);



