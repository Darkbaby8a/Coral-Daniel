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
        acepto,
        confirmado_en
      FROM invitados
      ORDER BY familia
    `);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        invitados: rows
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error.message
      }),
    };
  }
};
