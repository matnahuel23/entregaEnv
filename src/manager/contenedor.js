const fs = require('fs');
const path = require('path');
function generateUniqueId() {
    return Date.now().toString();
}
class Contenedor {
    constructor(file) {
        this.file = path.resolve(__dirname, file);
    }

    async getAllObjects() {
        try {
            const data = await fs.promises.readFile(this.file, 'utf-8');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    }

    async getById(id) {
        try {
            const objects = await this.getAllObjects();
            const obj = objects.find((o) => o.id === id);
            return obj || null;
        } catch (error) {
            throw new Error('Error al obtener el ID');
        }
    }

    async getAll() {
        try {
            const objects = await this.getAllObjects();
            return objects;
        } catch (error) {
            throw new Error('Error al obtener los objetos');
        }
    }

    async getRandom() {
        try {
            const objects = await this.getAllObjects();
            const randomIndex = Math.floor(Math.random() * objects.length);
            return objects[randomIndex];
        } catch (error) {
            throw new Error('Error al obtener un objeto aleatorio');
        }
    }

    async deleteById(id) {
        try {
            const productToDelete = await this.getById(id);
            
            if (!productToDelete) {
                throw new Error(`Producto con ID ${id} no encontrado.`);
            }
            let objects = await this.getAllObjects();
            objects = objects.filter((o) => o.id.toString() !== id.toString());
            await this.saveObjects(objects);
        } catch (error) {
            throw new Error('Error al eliminar el objeto');
        }
    }
    
    
    async deleteAll() {
        try {
            await this.saveObjects([]);
        } catch (error) {
            throw new Error('Error al eliminar los objetos');
        }
    }

    async saveObjects(objects) {
        try {
            await fs.promises.writeFile(this.file, JSON.stringify(objects, null, 2));
        } catch (error) {
            console.error("Error al guardar objetos:", error);
            throw new Error('Error al guardar objetos');
        }
    }

    async save(obj) {
        try {
            const objects = await this.getAllObjects();
            const existingObjectIndex = objects.findIndex(
                (o) => o.title === obj.title && o.description === obj.description && o.code === obj.code
            );
    
            if (existingObjectIndex !== -1) {
                // Si el objeto ya existe, actualizamos sus propiedades
                objects[existingObjectIndex] = { ...objects[existingObjectIndex], ...obj };
            } else {
                // Si el objeto no existe, lo agregamos como nuevo
                const newId = generateUniqueId();
                const newObj = { id: newId, ...obj };
                objects.push(newObj);
            }
    
            await this.saveObjects(objects);
            return obj.id;
        } catch (error) {
            throw new Error('Error al guardar o actualizar el objeto');
        }
    }
    
}

module.exports = Contenedor;
