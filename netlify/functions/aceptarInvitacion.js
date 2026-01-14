import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const handler = async (event) => {
  console.log("Evento recibido:", event.body);

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    const familia = body.familia;

    console.log("Familia:", familia);

    const result = await pool.query(
      `
      UPDATE invitados
      SET acepto = true,
          confirmado_en = NOW()
      WHERE familia = $1
      RETURNING id;
      `,
      [familia]
    );

    console.log("Resultado:", result.rowCount);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, rowCount: result.rowCount }),
    };

  } catch (error) {
    console.error("ERROR REAL:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error.message,
        detail: error.detail || null
      }),
    };
  }
};
