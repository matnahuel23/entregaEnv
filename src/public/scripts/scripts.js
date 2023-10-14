const socket = io();

// Agregar un producto
document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const responseBody = await response.json();  // Parse the JSON response
            if (responseBody.result === "success"){
                const newProduct = responseBody.payload; 
                socket.emit('addProduct', newProduct);
            Swal.fire({
                icon: "success",
                title: "Producto agregado",
                text: `El producto ${newProduct.title} ha sido agregado exitosamente`
            });
            document.getElementById('title').value = "";
            document.getElementById('description').value = "";
            document.getElementById('code').value = "";
            document.getElementById('price').value = "";
            document.getElementById('stock').value = "";
            document.getElementById('category').value = "";
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo agregar el producto. Por favor, verifica los campos y vuelve a intentarlo."
            });
        }
    }}catch (error) {
        console.error("Error al agregar el producto:", error);
    }
});

// Función para actualizar el producto
async function updateProduct(product) {
    const pid = product._id; // Obtener el ID del producto
    
    // Obtener los datos actualizados del formulario
    const updatedProduct = {
        title: document.getElementById("titleUpdate").value,
        description: document.getElementById("descriptionUpdate").value,
        code: document.getElementById("codeUpdate").value,
        price: document.getElementById("priceUpdate").value,
        stock: document.getElementById("stockUpdate").value,
        category: document.getElementById("categoryUpdate").value,
    };

    // Realizar una solicitud PUT al servidor
    try {
        const response = await fetch(`/api/products/${pid}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProduct),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.result === "success") {
                Swal.fire({
                    icon: "success",
                    title: "Producto Actualizado",
                    text: `Producto ${product.title} Actualizado Exitosamente`,
                })
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: `No se pudo Actualizar el producto`,
                })
            }
        } else {
            console.error("Error al actualizar el producto:", response.status);
        }
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
    }
}

// Función para Eliminar el producto
async function deleteProduct(_id){
    const deleteId = _id; // Obtener el ID del producto
    
    try {
        const response = await fetch(`/api/products/${deleteId}`, {
            method: "DELETE",
        });

        if (response.ok) {
            socket.emit('deleteProduct', deleteId);
            Swal.fire({
                icon: "success",
                title: "Producto eliminado",
                text: `El producto con ID ${deleteId} ha sido eliminado exitosamente`,
            });
            document.getElementById('delete-id').value = "";
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
}

// Buscar producto por titulo con ELIMINAR/ACTUALIZAR producto
document.getElementById("find-form-title").addEventListener("submit", async (e) => {
    e.preventDefault();

    const findTitle = document.getElementById("find-title").value
    const resultContainer = document.getElementById("search-result")

    try {
        const response = await fetch(`/api/products/search:title?title=${findTitle}`, {
            method: "GET",
        })
        if (response.ok) {
            const data = await response.json()

            if (data.result === "success") {
                const product = data.payload;
                resultContainer.innerHTML = `
                    <h3>Detalles del Producto</h3>
                    <label for="title"><strong>Nombre:</strong></label>
                    <input type="text" id="titleUpdate" value="${product.title}">
                    
                    <label for="description"><strong>Descripción:</strong></label>
                    <input type="text" id="descriptionUpdate" value="${product.description}">
                    
                    <label for="code"><strong>Código:</strong></label>
                    <input type="number" id="codeUpdate" value="${product.code}">
                    
                    <label for="price"><strong>Precio:</strong></label>
                    <input type="number" id="priceUpdate" value="${product.price}">
                    
                    <label for="stock"><strong>Stock:</strong></label>
                    <input type="number" id="stockUpdate" value="${product.stock}">
                    
                    <label for="category"><strong>Categoría:</strong></label>
                    <select id="categoryUpdate">
                        <option value="gaseosa" ${product.category === "gaseosa" ? "selected" : ""}>Gaseosa</option>
                        <option value="vino" ${product.category === "vino" ? "selected" : ""}>Vino</option>
                        <option value="cerveza" ${product.category === "cerveza" ? "selected" : ""}>Cerveza</option>
                    </select>
                    
                    <label for="thumbnails"><strong>Imagen:</strong></label>
                    <input type="file" name="thumbnails" id="thumbnailsUpdate">

                    <p><strong>ID:</strong> ${product._id}</p>

                    <button id="update-button">Actualizar</button>
                    <button id="delete-button">Eliminar</button>
                `;

                // Botón "Actualizar"
                const updateButton = document.getElementById("update-button");
                if (updateButton) {
                    updateButton.addEventListener("click", () => {
                        updateProduct(product);
                    });
                }
                // Botón "Eliminar"
                const deleteButton = document.getElementById("delete-button");
                if (deleteButton) {
                    deleteButton.addEventListener("click", () => {
                        deleteProduct(product._id);
                    });
                }

            } else {
                // Producto no encontrado
                resultContainer.innerHTML = "<p>Producto no encontrado.</p>";
            }
            document.getElementById('find-title').value = ""; // Limpiar el campo de búsqueda
        } else {
            console.error("Error al buscar el producto:", response.status);
        }
    } catch (error) {
        console.error("Error al buscar el producto:", error);
    }
});
