const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
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

//Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    console.log(payload.name);
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(request, response) => {
    let token = request.body.idtoken;
    let googleUser = await verify(token)
        .catch(error => {
            return response.status(403).json({
                ok: false,
                error: error
            });
        });

    Usuario.findOne({ email: googleUser.email }, (error, usuarioDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                error
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return response.status(400).json({
                    ok: false,
                    error: {
                        message: 'Usuario ya registrado, debe usar la autenticación normal'
                    }
                });
            } else {
                //si previamente se ha autenticado mediente google, renovamos su token para pueda seguir trabajando
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return response.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            //si el usuario no existe en la base de datos
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = googleUser.google;
            usuario.password = ':)';

            usuario.save((error, usuarioDB) => {
                if (error) {
                    return response.status(500).json({
                        ok: false,
                        error
                    });
                }
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return response.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
});

module.exports = app;