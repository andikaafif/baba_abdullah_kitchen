import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Baba Abdullah Kitchen API running at http://localhost:${PORT}`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
});
