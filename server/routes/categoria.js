const express = require('express');
let { verificaToken, verificaADMIN_ROLE } = require('../middlewares/autenticacion');
let app = express();
let Categoria = require('../models/categoria');

//================================
//Mostrar todas las categorias
//================================
app.get('/categoria', verificaToken, (request, response) => {
    Categoria.find({}).sort('descripcion').populate('usuario', 'nombre email').exec((error, categorias) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        response.json({
            ok: true,
            categorias
        });
    });
});

//================================
//Mostrar una categoria por ID
//================================
app.get('/categoria/:id', verificaToken, (request, response) => {
    let id = request.params.id;
    Categoria.findById(id).exec((error, categoriaDB) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        if (!categoriaDB) {
            return response.status(400).json({
                ok: false,
                error: {
                    message: 'El id de categoria no es correcto'
                }
            });
        }

        response.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//================================
//Crear una nueva categoria
//================================
app.post('/categoria', verificaToken, (request, response) => {
    let body = request.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: request.usuario._id
    });

    categoria.save((error, categoriaDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                error
            });
        }
        if (!categoriaDB) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        response.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//================================
//Actualizar una categoria
//================================
app.put('/categoria/:id', verificaToken, (request, response) => {
    let id = request.params.id;
    //we just pick values we want to update, not password nor google status
    let body = request.body;

    Categoria.findByIdAndUpdate(id, { descripcion: body.descripcion }, { new: true, runValidators: true }, (error, categoriaDB) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        response.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//================================
//Eliminar una categoria
//================================
app.delete('/categoria/:id', [verificaToken, verificaADMIN_ROLE], (request, response) => {
    //Solo un administrador puede borrar categorias
    //Categoria.findBydIdAndRemove();
    let id = request.params.id;

    Categoria.findByIdAndRemove(id, (error, categoriaBorrada) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        if (!categoriaBorrada) {
            return response.status(400).json({
                ok: false,
                error: {
                    message: 'Id de la categoria no existe'
                }
            });
        }
        response.json({
            ok: true,
            categoria: categoriaBorrada,
            message: 'Categoria borrara'
        });
    });
});

module.exports = app;