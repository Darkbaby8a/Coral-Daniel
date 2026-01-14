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
    // 1️⃣ Leer datos enviados desde el frontend
    const { familia } = JSON.parse(event.body);

    if (!familia) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, message: "Familia requerida" }),
      };
    }

    // 2️⃣ UPDATE en Neon
    const result = await pool.query(
      `
      UPDATE public.invitados
      SET acepto = true,
          confirmado_en = NOW()
      WHERE familia = $1
        AND acepto = false
      RETURNING id;
      `,
      [familia]
    );

    // 3️⃣ Si no se actualizó nada
    if (result.rowCount === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: false,
          message: "Invitación no encontrada o ya confirmada",
        }),
      };
    }

    // 4️⃣ Todo bien
    console.log("Invitación confirmada:", familia);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };

  } catch (error) {
    // 🔍 Logs útiles para Netlify
    console.error("ERROR Neon:", error.message);

    const check = await pool.query(
      "SELECT current_database(), current_schema(), to_regclass('public.invitados')"
    );

    console.log("CHECK:", check.rows);

    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error.message,
        check: check.rows,
      }),
    };
  }
};
