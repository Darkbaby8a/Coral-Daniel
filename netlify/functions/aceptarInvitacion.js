import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL_UNPOOLED,
  ssl: { rejectUnauthorized: false },
});

export const handler = async (event) => {

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, message: "Method Not Allowed" }),
    };
  }

  try {
    const { familia, asistira } = JSON.parse(event.body);

    if (!familia || typeof asistira !== "boolean") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          message: "Datos incompletos",
        }),
      };
    }

    // Determinar valores dinámicamente
    const acepto = asistira === true;
    const rechazo = asistira === false;

    const result = await pool.query(
      `
      UPDATE public.invitados
      SET 
        acepto = $1,
        rechazo = $2,
        confirmado_en = NOW()
      WHERE familia = $3
      RETURNING id;
      `,
      [acepto, rechazo, familia]
    );

    if (result.rowCount === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: false,
          message: "Invitación no encontrada",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        asistira,
      }),
    };

  } catch (error) {
    console.error("ERROR Neon:", error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error.message,
      }),
    };
  }
};
