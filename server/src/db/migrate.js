import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/*
 * Works in both worlds:
 *  - Full-privilege MySQL (Docker, VPS): creates the database if missing.
 *  - cPanel shared hosting: the DB is created in the panel and the user has
 *    no CREATE DATABASE privilege — we connect straight to it and apply schema.
 */
async function main() {
  const base = {
    host: process.env.DB_HOST, port: +(process.env.DB_PORT || 3306),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    multipleStatements: true,
  }

  let conn
  try {
    conn = await mysql.createConnection(base)
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    await conn.query(`USE \`${process.env.DB_NAME}\``)
  } catch (e) {
    if (conn) await conn.end().catch(() => {})
    console.log(`(no CREATE DATABASE privilege — connecting directly to ${process.env.DB_NAME})`)
    conn = await mysql.createConnection({ ...base, database: process.env.DB_NAME })
  }

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await conn.query(schema)
  console.log('Schema applied to', process.env.DB_NAME)
  await conn.end()
}

main().catch((e) => { console.error(e); process.exit(1) })
