http://localhost:8080/
es donde gestiono el ingreso de productos con ingreso de imagen/optativa usando multer. Se puede eliminar el producto con su id que genera MongoDb 
Quedan guardados en BD.
![ingreso al stock HBS en http://localhost:8080/](src/public/prints/ingreso%20hbs.jpg)

http://localhost:8080/products
es donde se ven todos los productos que estan en el Inventario, al agregar productos en este caso se agregaran a un carrito fijo: 64fe00e848bf8c0028d9a31d, esto lo cambiare a futuro. Los productos se descuentan del stock y se suman a la cantidad de ese producto en el carrito. A su vez estan los filtros por Categoria: en este caso tengo 3(gaseosa, vino, cerveza) y por estado: true o false, aunque estan todos en true por ahora.Tambien se puede ordenar en forma asc o desc segun precio. Para poner varios filtros puse un boton aplicar filtros
![ingreso al carrito HBS 1 en http://localhost:8080/products](src/public/prints/stock%20hbs1.jpg)
![ingreso al carrito HBS 2 en http://localhost:8080/products](src/public/prints/stock%20hbs2.jpg)

http://localhost:8080/cart/64fe00e848bf8c0028d9a31d
El carrito esta precargado con cid: 64fe00e848bf8c0028d9a31d en esta vista se ven los productos que tiene ese cart en particular, con el boton eliminar se pueden eliminar productos, los cuales van volviendo a su stock original. Abajo a la derecha hay un boton con el total, aun ese boton no hace nada, lo cambiare a futuro.
![carrito en http://localhost:8080/cart/64fe00e848bf8c0028d9a31d](src/public/prints/cart.jpg)

http://localhost:8080/chat
si entran varios usuarios pueden chatear

Producto POST
http://localhost:8080/api/products

{
    "title": "ProductoG",
    "description": "productoGDescrip",
    "code": 25,
    "price": 77 ,
    "stock": 77,
    "category": "gaseosa"
}

Cart POST
http://localhost:8080/api/cart

{}

Producto en carrito
http://localhost:8080/api/cart/64ecba4c87d8ed151354846a/product/64eb59607130eb4f5e2080a5
{
  "quantity": 5
}


![ingreso de producto en http://localhost:8080/](src/public/prints/localhost%20de%20ingreso.jpg)
![eliminacion de producto en http://localhost:8080/](src/public/prints/localhost%20de%20eliminacion.jpg)
![postman producto](src/public/prints/postProduct.jpgg)
![postman cart](src/public/prints/postCart.jpg)
![postman cart con producto y cantidad](src/public/prints/postCartProduct.jpg)
![visualizacion de productos agregados en tiempo real](src/public/prints/localhost%208080%20realtimeproducts.jpg)
![chat](src/public/prints/chat%20.jpg)
