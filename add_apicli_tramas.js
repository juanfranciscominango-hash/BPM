const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

async function run() {
  await client.connect();
  
  const resProcess = await client.query("SELECT id FROM external_process WHERE code = 'APICLI'");
  const processId = resProcess.rows[0].id;

  const resRoot = await client.query("SELECT id FROM trama_field WHERE process_id = $1 AND trama_type = 'OUTPUT' AND name = '_Root'", [processId]);
  const rootId = resRoot.rows[0].id;

  const fieldsToAdd = [
    'interviniente_int_estado_civil',
    'fecha_nacimiento',
    'primer_apellido',
    'segundo_apellido',
    'primer_nombre',
    'segundo_nombre',
    'edad',
    'direccion_domicilio',
    'genero',
    'nacionalidad',
    'estado_civil_solicitante',
    'subsegmento',
    'tiene_conyuge_solicitante',
    'nivel_estudios',
    'lista_observados'
  ];

  for (const f of fieldsToAdd) {
    const exists = await client.query("SELECT id FROM trama_field WHERE process_id = $1 AND trama_type = 'OUTPUT' AND name = $2", [processId, f]);
    if (exists.rows.length === 0) {
      await client.query(
        "INSERT INTO trama_field (process_id, trama_type, name, parent_id, default_assignment) VALUES ($1, $2, $3, $4, 'ASIGNAR SIEMPRE')",
        [processId, 'OUTPUT', f, rootId]
      );
      console.log('Inserted:', f);
    } else {
      console.log('Already exists:', f);
    }
  }
  
  await client.end();
}

run().catch(console.error);
