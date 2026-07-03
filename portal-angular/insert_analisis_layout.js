const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'INC_BPM_PLATFORM',
    password: 'Desarrollo',
    port: 5432
});

async function run() {
    await client.connect();
    
    const layout = {
      "stepper": 3,
      "tabs": [
        {
          "title": "Análisis de Crédito",
          "sections": [
            {
              "title": "Resumen de la Solicitud",
              "columns": 2,
              "fields": [
                {
                  "name": "monto_solicitado",
                  "label": "Monto Solicitado",
                  "type": "number",
                  "readOnly": true
                },
                {
                  "name": "plazo_meses",
                  "label": "Plazo (meses)",
                  "type": "number",
                  "readOnly": true
                }
              ]
            },
            {
              "title": "Decisión del Analista",
              "columns": 1,
              "fields": [
                {
                  "name": "decision_analista",
                  "label": "Decisión de Crédito",
                  "type": "combo",
                  "required": true,
                  "config": {
                    "options": [
                      { "codigo": "APROBADO", "descripcion": "Aprobar Crédito" },
                      { "codigo": "RECHAZADO", "descripcion": "Rechazar Crédito" },
                      { "codigo": "DEVUELTO", "descripcion": "Devolver a Asesor" }
                    ],
                    "valueField": "codigo",
                    "labelField": "descripcion"
                  }
                },
                {
                  "name": "observaciones_analista",
                  "label": "Observaciones y Justificación",
                  "type": "textarea",
                  "required": true
                }
              ]
            }
          ]
        }
      ],
      "validations": [],
      "actions": []
    };

    const processKey = 'flujo_negociacion_y_venta_(bizagi)';
    const taskKey = 'Activity_14xyo9t';

    const res = await client.query('UPDATE screen_definition SET layout_json = $1 WHERE process_key = $2 AND task_key = $3 RETURNING id', [JSON.stringify(layout), processKey, taskKey]);
    
    if (res.rowCount > 0) {
        console.log('Layout updated successfully for Activity_14xyo9t');
    } else {
        console.log('Task not found in screen_definition, inserting...');
        await client.query('INSERT INTO screen_definition (process_key, task_key, layout_json) VALUES ($1, $2, $3)', [processKey, taskKey, JSON.stringify(layout)]);
        console.log('Layout inserted successfully for Activity_14xyo9t');
    }

    await client.end();
}
run().catch(console.error);
