// Función para aplicar filtros y ordenar
function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const priceSort = document.getElementById('priceSort').value;
    const perPage = document.getElementById('perPage').value;

    // Inicializar la URL base
    let url = '/products?';

    // Crear un objeto para almacenar los filtros seleccionados
    const filters = {};

    // Agregar filtro de categoría si está seleccionado
    if (categoryFilter) {
        filters.category = categoryFilter;
    }

    // Agregar filtro de estado si está seleccionado
    if (statusFilter) {
        filters.status = statusFilter;
    }

    // Agregar filtro de orden por precio si está seleccionado
    if (priceSort) {
        filters.sort = priceSort;
    }

    // Agregar filtro de cantidad de productos por página si está seleccionado
    if (perPage) {
        filters.limit = perPage;
    }

    // CREO URL
    if (filters.category) {
        url += `category=${filters.category}&`;
    }
    if (filters.status) {
        url += `status=${filters.status}&`;
    }
    if (filters.sort) {
        url += `sort=${filters.sort}&`;
    }
    if (filters.limit) {
        url += `limit=${filters.limit}&`;
    }

    // Redireccionar a la nueva URL con los filtros aplicados
    window.location.href = url;
}

// Agrega producto al carrito
document.querySelectorAll('form[id^="addToCartForm-"]').forEach(function (form) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const formId = this.id; // Obtén el ID completo del formulario
        const productIdFromFormId = formId.replace("addToCartForm-", "");
        const quantityInput = this.querySelector('input[name="quantity"]');
        const quantity = parseInt(quantityInput.value);

        if (isNaN(quantity) || quantity <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La cantidad debe ser un número mayor que 0.',
                timer: 2000
            });
            return;
        }

        try {
            const response = await fetch(`/api/cart/${cart}/product/${productIdFromFormId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: quantity })
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Producto agregado al carrito correctamente.',
                    timer: 2000
                });
                // Espera 2 segundos antes de recargar la página
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al agregar el producto.',
                    timer: 2000
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al agregar el producto.',
                timer: 2000
            });
        }
    });
});

// Elimina producto del carrito
document.querySelectorAll('form[id^="deleteToCartForm-"]').forEach(function (form) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const formId = this.id; // Obtén el ID completo del formulario
        const productIdFromFormId = formId.replace("deleteToCartForm-", "");
        const quantityInput = this.querySelector('input[name="quantity"]');
        const quantity = parseInt(quantityInput.value);

        if (isNaN(quantity) || quantity <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La cantidad debe ser un número mayor que 0.',
                timer: 2000
            });
            return;
        }

        try {
            const response = await fetch(`/api/cart/${cart}/product/${productIdFromFormId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: quantity })
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Producto eliminado del carrito correctamente.',
                    timer: 2000
                });
                // Espera 2 segundos antes de recargar la página
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al eliminar el producto.',
                    timer: 2000
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al eliminar el producto.',
                timer: 2000
            });
        }
    });
});
