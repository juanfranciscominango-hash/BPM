const { Client } = require('pg');
async function run() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  try {
    const sql = `
      ALTER TABLE DY_SOLICITUD_CREDITO_RECOMENDADA 
      ALTER COLUMN cliente_id TYPE TEXT,
      ALTER COLUMN monto_solicitado TYPE TEXT,
      ALTER COLUMN plazo_meses TYPE TEXT,
      ALTER COLUMN tasa_interes TYPE TEXT,
      ALTER COLUMN cuota_estimada TYPE TEXT,
      ALTER COLUMN ingresos_totales TYPE TEXT,
      ALTER COLUMN gastos_totales TYPE TEXT,
      ALTER COLUMN score_buro TYPE TEXT;
    `;
    await c.query(sql);
    console.log('Columnas alteradas a TEXT exitosamente.');
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}
run();
