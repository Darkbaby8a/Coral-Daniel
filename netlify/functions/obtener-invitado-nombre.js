import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL_UNPOOLED,
  ssl: { rejectUnauthorized: false },
});

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const nombre = event.queryStringParameters?.displayname;

  if (!nombre) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, message: "DisplayName requerido" }),
    };
  }

  try {
    const result = await pool.query(
      `
      SELECT
        familia,
        pases,
        acepto,
        displayname,
        pasesuti AS pasesyausados
      FROM public.invitados
      WHERE displayname ILIKE $1
      ORDER BY displayname
      LIMIT 5;
      `,
      [`%${nombre}%`]
    );

    if (result.rowCount === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: false }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        invitados: result.rows.map(r => ({
          familia: r.familia,
          pases: r.pases,
          acepto: r.acepto,
          displayname: r.displayname,
          pasesuti: r.pasesyausados || 0,
        })),
      }),
    };

  } catch (error) {
    console.error("ERROR buscar por displayname:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error.message,
      }),
    };
  }
};
