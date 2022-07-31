const { pool } = require('./conexion');

const guardarTransferencia = async (datos) => {
    const values = Object.values(datos);
    //Values[0] = emisor, [1] = receptor, [2] = monto
    let respuesta;
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // Seccion descontar
            const descontar = {
                text: "UPDATE usuarios SET balance = balance - $1 WHERE id = $2 AND estado = true;",
                values: [Number(values[2]), values[0]],
            }
            const checkDescontar = await client.query(descontar);

            const acreditar = {
                text: "UPDATE usuarios SET balance = balance + $1 WHERE id = $2 AND estado = true;",
                values: [Number(values[2]), values[1]],
            }
            const checkAcreditar = await client.query(acreditar);

            const transferencia = {
                text: "INSERT INTO transferencias (emisor,receptor,monto,fecha) VALUES ($1,$2,$3,CURRENT_TIMESTAMP);",
                values: [values[0], values[1], Number(values[2])]
            }

            //Verificamos si se updateo o no, debido al estado / balance del cliente y verificamos con rowcount para ver las rows afectadas,
            //de no estar afectadas, pueede ser que el usuario no tenga el saldo suficiente o el usuario este deshabilitado
            if (checkDescontar.rowCount == 1 && checkAcreditar.rowCount == 1){
                const result = await client.query(transferencia);
                await client.query('COMMIT');
                respuesta = result;
                return respuesta;
            }else{
                await client.query('ROLLBACK');
                return  {error_datos: 'ERROR'}
            }
        } catch (error) {
            await client.query('ROLLBACK');
            console.log('Error al Guardar Transferencia: ', error.code);
            client.release();
            throw error;
        }
    } catch (error) {
        console.log(error);
        return error;
    }
}

const getTransferencias = async () => {
    const { rows } = await pool.query("SELECT * FROM transferencias;");
    try {
        for (const element of rows) {
                emisor = {
                text: "SELECT u.nombre FROM usuarios u JOIN transferencias t ON u.id = t.emisor WHERE t.emisor = $1;",
                values: [element.emisor],
            }
            receptor = {
                text: "SELECT u.nombre FROM usuarios u JOIN transferencias t ON u.id = t.receptor WHERE t.receptor = $1;",
                values: [element.receptor],
            }
            const queryEmisor = await pool.query(emisor);
            const queryReceptor = await pool.query(receptor);

            element.emisor = queryEmisor.rows[0].nombre;
            element.receptor = queryReceptor.rows[0].nombre;

        }
    } catch (error) {
        console.log("Error al obtener transferencias:", error);
    }
    return rows;
}

module.exports = { guardarTransferencia, getTransferencias }