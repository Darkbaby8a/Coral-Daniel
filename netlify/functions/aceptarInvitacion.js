import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Neon
  ssl: { rejectUnauthorized: false },
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { familia } = JSON.parse(event.body);

  try {
    const result = await pool.query(
      `
            UPDATE invitados
            SET acepto = true,
                confirmado_en = NOW()
            WHERE familia = $1
              AND acepto = false
            RETURNING id;
            `,
      [familia]
    );

    if (result.rowCount === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: false,
          message: "Invitación ya confirmada o no encontrada",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false }),
    };
  }
};
