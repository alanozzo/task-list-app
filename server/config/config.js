//===================
//puerto
//===================
process.env.PORT = process.env.PORT || 3000;



//===================
//Entorno
//===================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


//===================
//Vencimiento del Token
//===================
//60 segundos por
//60 minutos por
//24 horas por
//30 dias
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;


//===================
//SEED semilla de autenticación
//===================
process.env.SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';


//===================
//Base de datos
//===================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;


//==========================
//Google Client ID
//==========================
process.env.CLIENT_ID || '377177552967-klngu3o54b9afpn7m2co8mhb4a02mq37.apps.googleusercontent.com';