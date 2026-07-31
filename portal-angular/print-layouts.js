const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Desarrollo@localhost:5432/INC_BPM_PLATFORM'
  });
  await client.connect();
  
  // 1. Get Entrega Documentacion (ID 33)
  const res33 = await client.query("SELECT id, name, layout_json FROM SCREEN_DEFINITION WHERE id=33;");
  console.log("=== SCREEN 33 (Entrega Documentacion) ===");
  if (res33.rows.length > 0) {
    console.log(res33.rows[0].layout_json);
  }
  
  // 2. Find screen with "Monto Aprobado" and "Cuota de Entrada"
  const all = await client.query("SELECT id, name, task_key, layout_json FROM SCREEN_DEFINITION;");
  all.rows.forEach(r => {
    if (r.layout_json && r.layout_json.includes('Monto Aprobado') && r.layout_json.includes('Cuota de Entrada')) {
      console.log(`\n=== FOUND SOURCE SCREEN ID=${r.id}, Name=${r.name}, TaskKey=${r.task_key} ===`);
      console.log(r.layout_json);
    }
  });

  await client.end();
}

main().catch(console.error);
