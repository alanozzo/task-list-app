const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

//=======================
//Obtener productos
//=======================
app.get('/productos', verificaToken, (request, response) => {
    //trae todos los productos
    //populate: cargar usuarios y categoria
    //paginado
    Producto.find({ disponible: true }).sort('descripcion').populate('categoria', 'descripcion').exec((error, productos) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        response.json({
            ok: true,
            productos
        });
    });
});


//=======================
//Obtener producto por ID
//=======================
app.get('/productos/:id', verificaToken, (request, response) => {
    //populate: cargar usuarios y categoria
    let id = request.params.id;
    Producto.findById(id).populate('categoria', 'descripcion').exec((error, productoDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                error
            });
        }
        if (!productoDB) {
            return response.status(400).json({
                ok: false,
                error: {
                    message: 'El id del producto no es correcto'
                }
            });
        }

        response.json({
            ok: true,
            producto: productoDB
        });
    });
});


//=======================
// Buscar productos
//=======================
app.get('/productos/buscar/:termino', verificaToken, (request, response) => {
    let termino = request.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex }).populate('categoria', 'nombre').exec((error, productos) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                error
            });
        }
        response.json({
            ok: true,
            productos
        });
    });
});

//=======================
//Crear un nuevo producto
//=======================
app.post('/productos', verificaToken, (request, response) => {
    //grabar el usuario
    //grabar una categoria del listado
    let body = request.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: request.usuario._id
    });

    producto.save((error, productoDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                error
            });
        }
        if (!productoDB) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        response.json({
            ok: true,
            producto: productoDB
        });
    });
});


//=======================
//Actualiza un producto
//=======================
app.put('/productos/:id', verificaToken, (request, response) => {
    //grabar el usuario
    //grabar una categoria del listado
    let id = request.params.id;
    //we just pick values we want to update, not password nor google status
    let body = request.body;

    let object = {
        descripcion: body.descripcion,
        categoria: body.categoria
    }

    Producto.findByIdAndUpdate(id, object, { new: true, runValidators: true }, (error, productoDB) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        response.json({
            ok: true,
            producto: productoDB
        });
    });
});


//=======================
//Borrar un producto
//=======================
app.delete('/productos/:id', verificaToken, (request, response) => {
    //solo cambiar el estatus de disponible a false
    let id = request.params.id;
    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true }, (error, productoBorrado) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        if (!productoBorrado) {
            return response.status(400).json({
                ok: false,
                error: {
                    message: 'Producto no encontrado'
                }
            });
        }
        response.json({
            ok: true,
            producto: productoBorrado
        });
    });
});



module.exports = app;