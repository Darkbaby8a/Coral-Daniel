import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL_UNPOOLED,
  ssl: { rejectUnauthorized: false },
});

export const handler = async () => {
  try {

    const { rows } = await pool.query(`
      SELECT
        familia,
        displayname,
        pases,
        COALESCE(pasesuti, 0) AS pasesuti,
        (pases - COALESCE(pasesuti, 0)) AS disponibles,
        acepto,
        confirmado_en,
        
        CASE
          WHEN acepto = true THEN 'acepto'
          WHEN rechazo = true THEN 'rechazo'
          ELSE 'pendiente'
        END AS estado,

        CASE WHEN acepto = false THEN true ELSE false END AS rechazo,
        CASE WHEN acepto IS NULL THEN true ELSE false END AS pendiente

      FROM invitados
      ORDER BY familia, displayname
    `);

    // ===== CALCULAR TOTALES =====
    const totales = {
      total_invitados: rows.length,
      total_aceptaron: 0,
      total_rechazaron: 0,
      total_pendientes: 0,
      total_disponibles: 0
    };

    rows.forEach(i => {
      if (i.estado === "acepto") totales.total_aceptaron++;
      if (i.estado === "rechazo") totales.total_rechazaron++;
      if (i.estado === "pendiente") totales.total_pendientes++;

      totales.total_disponibles += Number(i.disponibles);
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        invitados: rows,
        totales
      }),
    };

  } catch (error) {

    console.error("Error listar invitados:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: "Error interno del servidor"
      }),
    };
  }
};
