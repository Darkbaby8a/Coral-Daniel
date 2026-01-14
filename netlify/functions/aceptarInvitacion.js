import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL_UNPOOLED,
  ssl: { rejectUnauthorized: false },
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { familia } = JSON.parse(event.body);

    const result = await pool.query(
      `
    SELECT * from invitados
      `
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: result.rowCount > 0 }),
    };

  } catch (error) {
    const check = await pool.query(
  "SELECT to_regclass('public.invitados')"
);
console.log(check.rows);
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message,rows:check.rows,dburl:process.env.NETLIFY_DATABASE_URL_UNPOOLED }),
    };
  }
};





