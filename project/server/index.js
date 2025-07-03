import express from 'express'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import cors from 'cors';

dotenv.config()
app.use(cors());
const app = express()
const port = 3001

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

app.get('/api/test', async (req, res) => {
  const result = await pool.query('SELECT NOW()')
  res.json(result.rows)
})

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
