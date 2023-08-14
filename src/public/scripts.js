const socket = io();

document.getElementById("username-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById("username");
    const username = usernameInput.value;

    socket.emit("newUser", username);

    Swal.fire({
        icon: "success",
        title: "Bienvenido a la carga de productos",
        text: `Estas conectado como: ${username}`
    });

    document.getElementById("username-form").style.display = "none";
    document.getElementById("product-form").style.display = "block";
});

document.getElementById("form").addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const code = document.getElementById("code").value;
    const price = document.getElementById("price").value;
    const stock = document.getElementById("stock").value;
    const category = document.getElementById("category").value; 

    const product = {
        title,
       description,
        code,
        price,
        stock,
        category
    };

    Swal.fire({
        icon: "success",
        title: "Producto agregado",
        text: `El producto ${product.title} ha sido agregado exitosamente`
    });

    socket.emit("addProduct", product);

    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("code").value = "";
    document.getElementById("price").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("category").value = "";
});

socket.on("productAdded", (product) => {
    console.log("Product added:", product.title);
    const productTable = document.getElementById("product-table").getElementsByTagName("tbody")[0];
    const newRow = productTable.insertRow();
    const nameCell = newRow.insertCell(0);
    nameCell.innerHTML = product.title;
    const stockCell = newRow.insertCell(1);
    stockCell.innerHTML = product.stock; 
});

// Función para cargar y mostrar todos los productos en la tabla
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        const productTable = document.getElementById("product-table").getElementsByTagName("tbody")[0];
        productTable.innerHTML = ''; // Limpiar la tabla antes de cargar los productos

        products.forEach((product) => {
            const newRow = productTable.insertRow();
            const nameCell = newRow.insertCell(0);
            nameCell.innerHTML = product.title;
            const stockCell = newRow.insertCell(1);
            stockCell.innerHTML = product.stock;
        });
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
}

// Cargar los productos al cargar la página
window.addEventListener('load', loadProducts);



