const express = require('express');
const fs = require('fs');
const path = require('path');
let app = express();
const { verificaTokenImg } = require('../middlewares/autenticacion');


app.get('/imagen/:tipo/:img', verificaTokenImg, (request, response) => {
    let tipo = request.params.tipo;
    let img = request.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);
    let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');

    if (fs.existsSync(pathImagen)) {
        response.sendFile(pathImagen);
    } else {
        response.sendFile(noImagePath);
    }
});

module.exports = app;