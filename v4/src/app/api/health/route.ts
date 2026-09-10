import { pool } from "@/legacy/pool";

export async function GET() {
  await pool.query("select 1");
  return Response.json({ status: "OK" });
}
