const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (request, response) => {
    let body = request.body;

    Usuario.findOne({ email: body.email }, (error, usuarioDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                error
            });
        }

        if (!usuarioDB) {
            return response.status(400).json({
                ok: false,
                error: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return response.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        response.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});

module.exports = app;