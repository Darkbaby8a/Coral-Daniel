import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL_UNPOOLED,
  ssl: { rejectUnauthorized: false },
});

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const familia = event.queryStringParameters?.familia;

  if (!familia) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, message: "Familia requerida" }),
    };
  }

  try {
    const result = await pool.query(
      `
      SELECT familia, pases, acepto, DisplayName
      FROM public.invitados
      WHERE familia = $1
      LIMIT 1;
      `,
      [familia]
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
        invitado: {
          Familia: result.rows[0].DisplayName,
          Pases: result.rows[0].pases,
          Acepto: result.rows[0].acepto,
        },
      }),
    };
  } catch (error) {
    console.error(error);
     const result2 = await pool.query(
      `
     SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'invitados'
ORDER BY ordinal_position;
      `
    );

    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message,result:result2 }),
    };
  }
};
