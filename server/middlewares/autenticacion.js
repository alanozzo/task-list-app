const jwt = require('jsonwebtoken');

//===========================
//Verificar Token
//==========================
let verificaToken = (request, response, next) => {
    //con '.get' obtenemos los headers del request
    let token = request.get('Token');

    jwt.verify(token, process.env.SEED, (error, decoded) => { //decoded means información decodificada
        if (error) {
            return response.status(401).json({ //401 means request unauthorized
                ok: false,
                error: {
                    message: 'Token no válido'
                }
            });
        }

        request.usuario = decoded.usuario;
        next();
    });
};

//===========================
//Verificar ADMIN_ROLE
//==========================
let verificaADMIN_ROLE = (request, response, next) => {
    let usuario = request.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return response.json({
            ok: false,
            error: {
                message: 'El usuario no es administrador'
            }
        });
    }

};


//===========================
//Verificar token para imagen
//==========================
let verificaTokenImg = (request, response, next) => {
    let token = request.query.token;
    jwt.verify(token, process.env.SEED, (error, decoded) => { //decoded means información decodificada
        if (error) {
            return response.status(401).json({ //401 means request unauthorized
                ok: false,
                error: {
                    message: 'Token no válido'
                }
            });
        }

        request.usuario = decoded.usuario;
        next();
    });
}


module.exports = {
    verificaToken,
    verificaADMIN_ROLE,
    verificaTokenImg
}