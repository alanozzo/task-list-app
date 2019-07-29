const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const _ = require('underscore');
const Usuario = require('../models/usuario');
const { verificaToken, verificaADMIN_ROLE } = require('../middlewares/autenticacion'); //we call a middleware


app.get('/usuarios', verificaToken, function(req, res) {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 0;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado img').skip(desde).limit(limite).exec((error, usuarios) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }

        Usuario.count({ estado: true }, (error, conteo) => {
            res.json({
                ok: true,
                usuarios,
                cuantos: conteo
            });
        });
    });
});

app.post('/usuarios', [verificaToken, verificaADMIN_ROLE], function(req, res) {

    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((error, usuarioDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }
        // usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.put('/usuarios/:id', [verificaToken, verificaADMIN_ROLE], function(req, res) {
    let id = req.params.id;
    //we just pick values we want to update, not password nor google status
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (error, usuarioDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.put('/updateStatusUsuarios/:id', [verificaToken, verificaADMIN_ROLE], function(req, res) {
    let id = req.params.id;
    //we just pick values we want to update, not password nor google status
    let body = _.pick(req.body, ['estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true }, (error, usuarioDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.delete('/usuarios/:id', [verificaToken, verificaADMIN_ROLE], function(req, res) {
    let id = req.params.id;

    // Usuario.findByIdAndRemove(id, (error, usuarioBorrado) => {
    Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (error, usuarioBorrado) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;