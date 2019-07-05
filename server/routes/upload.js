const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {
    let tipo = req.params.tipo;
    let id = req.params.id;
    if (Object.keys(req.files).length == 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningun archivo'
                }
            });
    }

    //validar tipo
    let tiposValidados = ['productos', 'usuarios'];
    if (tiposValidados.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos  permitidos son ' + tiposValidados.join(', ')
            }
        });
    }

    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    //extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitida son ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    //cambiar nombre al archivo
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //aquí la imagen se cargó(está en filesystem)
        imagenUsuario(id, res, nombreArchivo, tipo);
    });
});

function imagenUsuario(id, res, nombreArchivo, tipo) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (error, usuarioDB) => {
            if (error) {
                borraArchivo(usuarioDB.img, 'usuarios');
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!usuarioDB) {
                borraArchivo(usuarioDB.img, 'usuarios');
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario no existe'
                    }
                });
            }

            borraArchivo(usuarioDB.img, 'usuarios');
            usuarioDB.img = nombreArchivo;

            usuarioDB.save((error, usuarioGuardado) => {
                res.json({
                    ok: true,
                    usaurio: usuarioGuardado,
                    img: nombreArchivo
                });
            });

        });
    } else if (tipo === 'productos') {
        Producto.findById(id, (error, productoDB) => {
            if (error) {
                borraArchivo(productoDB.img, 'productos');
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                borraArchivo(productoDB.img, 'productos');
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario no existe'
                    }
                });
            }
            borraArchivo(productoDB.img, 'productos');
            productoDB.img = nombreArchivo;

            productoDB.save((error, productoGuardado) => {
                res.json({
                    ok: true,
                    usaurio: productoGuardado,
                    img: nombreArchivo
                });
            });

        });
    }

}

function imagenProducto(id, res, nombreArchivo, tipo) {

}

function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;