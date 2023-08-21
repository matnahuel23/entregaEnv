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

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const code = parseInt(document.getElementById('code').value);
    const price = parseFloat(document.getElementById('price').value);
    const stock = parseInt(document.getElementById('stock').value);
    const category = document.getElementById('category').value; 

    const product = {
        title,
        description,
        code,
        price,
        stock,
        category,
        thumbnails: [],
        status: true,
    };

    Swal.fire({
        icon: "success",
        title: "Producto agregado",
        text: `El producto ${product.title} ha sido agregado exitosamente`
    });

    socket.emit("addProduct", product);

    document.getElementById('title').value = "";
    document.getElementById('description').value = "";
    document.getElementById('code').value = "";
    document.getElementById('price').value = "";
    document.getElementById('stock').value = "";
    document.getElementById('category').value = "";
});

// Eliminar un producto
document.getElementById("delete-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const deleteId = document.getElementById("delete-id").value;
    
    try {
        const response = await fetch(`/api/products/${deleteId}`, {
            method: "DELETE",
        });
        if (response.ok) {
            Swal.fire({
                icon: "success",
                title: "Producto eliminado",
                text: `El producto con ID ${deleteId} ha sido eliminado exitosamente`,
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `No se pudo eliminar el producto con ID ${deleteId}`,
            });
        }
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
    }
});