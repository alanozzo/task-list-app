const express = require('express');
const { verificaToken, verificaADMIN_ROLE } = require('../middlewares/autenticacion');
const _ = require('underscore');
let app = express();
let Task = require('../models/tasks');


//=======================
//Get tasks
//=======================
app.get('/task', verificaToken, (request, response) => {
    Task.find({}).populate('usuario').exec((error, tasks) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        response.json({
            ok: true,
            tasks
        });
    });
});


//==========================================
//Get tasks and order depending user request
//==========================================
app.post('/task/sort', verificaToken, (request, response) => {
    let body = request.body;
    let findValues = {};

    if (body.estatus != "" && body.estatus != null && (body.estatus === "asc" || body.estatus === "desc")) {
        findValues.estatus = body.estatus
    }
    if (body.usuario != "" && body.usuario != null && (body.usuario === "asc" || body.usuario === "desc")) {
        findValues.usuario = body.usuario
    }
    if (body.fecha != "" && body.fecha != null && (body.fecha === "asc" || body.fecha === "desc")) {
        findValues.fecha = body.fecha
    }

    if (_.isEmpty(findValues)) {
       return response.status(400).json({
                ok: false,
                error: 'Debes especificar al menos un filtro de búsqueda, los valores correctos son asc: ascendente y desc: descendente'
        }); 
    }
    Task.find({}).populate('usuario').sort(findValues).exec((error, tasks) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        response.json({
            ok: true,
            tasks
        });
    });
});


//=======================
//Create new Task
//=======================
app.post('/task', verificaToken, (request, response) => {
    let body = request.body;
    let task = new Task({
        nombre: body.nombre,
        estatus: body.estatus,
        usuario: body.usuario,
        fecha: body.fecha
    });

    task.save((error, taskDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                error
            });
        }
        if (!taskDB) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        response.json({
            ok: true,
            task: taskDB
        });
    });
});


//=======================
//Update new Task
//=======================
app.put('/task', [verificaToken], function(req, res) {
    let id = req.body.id;
    console.log(id); 
    //we just pick values we want to update, not password
    let body = _.pick(req.body, ['nombre', 'estatus', 'img', 'fecha']);

    Task.findByIdAndUpdate(id, body, { new: true }, (error, taskDB) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }
        res.json({
            ok: true,
            task: taskDB
        });
    });
});


//=======================
//Delete Task
//=======================
app.delete('/task/:id', [verificaToken], function(req, res) {
    let id = req.params.id;

    Task.findByIdAndRemove(id, (error, deletedTask) => {
    // Task.findByIdAndUpdate(id, { estado: "Borrada" }, { new: true }, (error, deletedTask) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }
        if (!deletedTask) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'La tarea no existe, por favor verifica el ID'
                }
            });
        }
        res.json({
            ok: true,
            usuario: deletedTask
        });
    });
});

//=======================
//Find Task by status, usuarios or dates
//=======================
app.get('/task/find', verificaToken, (request, response) => {
    let body = request.body;
    let findValues = {};
    if (body.estatus != "" && body.estatus != null) {
        findValues.estatus = body.estatus
    }
    if (body.usuario != "" && body.usuario != null) {
        findValues.usuario = body.usuario
    }
    if (body.fecha != "" && body.fecha != null) {
        findValues.fecha = body.fecha
    }
    if (_.isEmpty(findValues)) {
       return response.status(400).json({
                ok: false,
                error: 'Debes especificar al menos un filtro de búsqueda'
        }); 
    }

    Task.find(findValues).populate('usuario').exec((error, tasks) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                error
            });
        }
        response.json({
            ok: true,
            tasks
        });
    });
});


//=======================
//Get array
//=======================
app.post('/array', verificaToken, (request, response) => {
    let body = request.body.array;
    let index = request.body.position;
    if (body == "" || body == null || index == "" || index == null) {
         return response.status(400).json({
            ok: false,
            error: 'Faltan parámetros'
        });
    }
    if (!body.some(isNaN)) {
        body.sort(function(a, b) {
          return a - b;
        });
        var position = body.indexOf(parseInt(index));
        if (position === -1) {
            body.push(parseInt(index));
            body.sort(function(a, b) {
              return a - b;
            });
            var position = body.indexOf(parseInt(index));
            var indexResp = `Posición ${index} insertada en el índice ${position}`;
        }else{
            var indexResp = `Posición ${index} encontrada en el índice ${position}`;
        }
        response.json({
                ok: true,
                array: body,
                index: indexResp
            });
    }else{
      return response.status(400).json({
            ok: false,
            error: 'Solo números son permitidos'
        });
    }
});

module.exports = app;