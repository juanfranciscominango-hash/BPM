const { Client } = require('pg');
async function run() {
  const c = new Client({user:'postgres',host:'localhost',database:'INC_BPM_PLATFORM',password:'Desarrollo',port:5432});
  await c.connect();
  try {
    const sql = `CREATE TABLE IF NOT EXISTS DY_SOLICITUD_CREDITO_RECOMENDADA (
      id SERIAL PRIMARY KEY, 
      process_instance_id VARCHAR(100), 
      cliente_id DOUBLE PRECISION, 
      monto_solicitado DOUBLE PRECISION, 
      plazo_meses DOUBLE PRECISION, 
      tasa_interes DOUBLE PRECISION, 
      cuota_estimada DOUBLE PRECISION, 
      ingresos_totales DOUBLE PRECISION, 
      gastos_totales DOUBLE PRECISION, 
      score_buro DOUBLE PRECISION, 
      datos_garantias TEXT, 
      datos_referencias TEXT, 
      resolucion_comite TEXT, 
      observaciones_generales TEXT, 
      oficial_credito TEXT, 
      agencia_origen TEXT, 
      estado_aprobacion TEXT, 
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    await c.query(sql);
    console.log('Tabla dinámica física creada exitosamente.');
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}
run();
