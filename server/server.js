require('./config/config');
const express = require('express');
const app = express();
const path = require('path');

// Using Node.js `require()`
const mongoose = require('mongoose');


const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded ---this is a middleware
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json ---this is a middleware
app.use(bodyParser.json());

//habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));

//Configuración global de rutas
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true
}, (error, response) => {
    if (error) throw error;

    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto', process.env.PORT);
});