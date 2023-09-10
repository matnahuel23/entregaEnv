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
