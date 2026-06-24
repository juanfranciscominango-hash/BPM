const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'INC_BPM_PLATFORM',
  password: 'Desarrollo',
  port: 5432,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");
    
    // Find the screen
    const res = await client.query("SELECT id, name, layout_json FROM screen_definition WHERE name LIKE '%Perfil y Condici%' OR task_key = 'Revisar Perfil y Condicion'");
    if (res.rows.length > 0) {
      const screen = res.rows[0];
      
      let layout = JSON.parse(screen.layout_json);
      
      // Add Simulador to the first tab if not already there
      if (layout.tabs && layout.tabs.length > 0) {
        // Remove if it exists to avoid duplicates
        layout.tabs = layout.tabs.filter(t => t.title !== "Simulador Interactivo");
        
        layout.tabs.unshift({
            title: "Simulador Interactivo",
            sections: [
                {
                    title: "Simulación de Crédito",
                    fields: [
                        {
                            name: "ctrl_simulador_1",
                            label: "Simulador",
                            controlType: "SIMULADOR",
                            cols: 12,
                            required: false,
                            readOnly: false
                        }
                    ]
                }
            ]
        });
        
        const newLayoutJson = JSON.stringify(layout);
        await client.query('UPDATE screen_definition SET layout_json = $1 WHERE id = $2', [newLayoutJson, screen.id]);
        console.log("Successfully updated layout_json in database.");
      }
    } else {
      console.log("Screen not found in database.");
    }
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await client.end();
  }
}

run();
