const { pool } = require('./conexion');

const guardarUsuario = async (datos) => {
    try {
        const values = Object.values(datos);
        const query = {
            text: "INSERT INTO usuarios (nombre,balance,estado) VALUES ($1,$2,true);",
            values,
        }
        const result = await pool.query(query);
        return result;
    } catch (error) {
        console.log('Error al guardar usuario:', error);
    }

}

const getUsuarios = async () => {
    try {
        const { rows } = await pool.query("SELECT id,nombre,balance FROM usuarios u WHERE u.estado = TRUE ORDER BY id ASC;");
        return rows;
    } catch (error) {
        console.log('Error al obtener usuarios:', error);
    }

}

const editarUsuario = async (usuario) => {
    try {
        const values = Object.values(usuario);
        const query = {
            text: "UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = $1",
            values,
        }
        const result = await pool.query(query);
        return result;
    } catch (error) {
        console.log('Error al editar usuario', error);
    }

}

const borrarUsuario = async (id) => {
    try {
        const query = {
            text: "UPDATE usuarios SET estado = FALSE WHERE id = $1;",
            values: [id],
        }
        const result = await pool.query(query);
        return result;
    } catch (error) {
        console.log('Error al eliminar usuario:', error);
    }

}

module.exports = { guardarUsuario, getUsuarios, editarUsuario, borrarUsuario }