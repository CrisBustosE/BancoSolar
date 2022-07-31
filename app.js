const express = require('express');
const app = express();
port = process.env.PORT || 3000;

app.listen(port, console.log('Servidor Inicializado en puerto:', port));
app.use(express.json());


const { guardarUsuario, getUsuarios, editarUsuario, borrarUsuario } = require('./sql/usuarios');
const { guardarTransferencia, getTransferencias } = require('./sql/transferencias');



app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/usuario", async (req, res) => {
    try {
        const usuario = req.body;
        if ('nombre' in usuario && 'balance' in usuario && Object.keys(usuario).length == 2) {
            const result = await guardarUsuario(usuario);
            res.status(201).json(result);
        } else {
            res.status(400).json('Parametros enviados invalidos.');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/usuarios", async (req, res) => {
    try {
        const usuarios = await getUsuarios();
        res.json(usuarios);
    } catch (error) {
        res.status(500).send(error);
    }
})

app.put("/usuario", async (req, res) => {
    try {
        req.body = { id: req.query.id, ...req.body }
        const usuario = req.body;
        if ('id' in usuario && 'nombre' in usuario && 'balance' in usuario && Object.keys(usuario).length == 3) {
            const result = await editarUsuario(usuario);
            res.status(201).json(result)
        } else {
            res.status(400).json('Sintaxis invalida, por favor verifique los datos ingresados.');
        }
    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
});

//usamos delete por convencion aunque se actualice el estado del usuario, para no alterar la tabla de transferencias.
app.delete("/usuario", async (req, res) => {
    try {
        const id = req.query.id;
        const result = await borrarUsuario(id);
        if (result.rowCount == 0){
            res.status(400).send('El usuario solicitado no existe.');
        }else{
            res.send('Usuario eliminado con éxito.');
        }
    } catch (error) {
        console.log(error);
    }
})

app.post("/transferencia", async (req, res) => {
    try {
        const transferencia = req.body;
        if (transferencia.emisor == transferencia.receptor) {
            res.status(400).json('No puedes transferir desde una cuenta a la misma cuenta!')
        } else {
            const result = await guardarTransferencia(transferencia);
            if (result.severity == 'ERROR') {
                res.status(400).send(result.detail);
            } else if (result.error_datos == 'ERROR'){
                res.status(400).send('Error, el monto o el usuario ingresado no es valido.');
            }else{
                res.status(201).json(result);
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
})

app.get("/transferencias", async (req, res) => {
    try {
        const transferencias = await getTransferencias();
        res.json(transferencias);
    } catch (error) {
        res.status(500).send(error);
    }
})
