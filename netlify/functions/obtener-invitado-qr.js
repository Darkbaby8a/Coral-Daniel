import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL_UNPOOLED,
  ssl: { rejectUnauthorized: false }
});

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { familia } = event.queryStringParameters || {};

  if (!familia) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, error: "familia requerido" })
    };
  }

  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        familia,
        displayname,
        pases,
        pasesuti,
        acepto,
        fechaacepto
      FROM invitados
      WHERE familia = $1
      LIMIT 1
    `, [familia]);

    if (rows.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: false })
      };
    }

    const i = rows[0];

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        invitado: {
          ...i,
          pasesuti: i.pasesuti ?? 0,
          disponibles: (i.pases ?? 0) - (i.pasesuti ?? 0)
        }
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
