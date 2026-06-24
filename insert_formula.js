const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

const canvasJson = [
  {"id":"v_1_1","type":"variable","label":"Monto","value":"monto"},
  {"id":"o3_2","type":"operator","label":"x","value":"*"},
  {"id":"o5_3","type":"operator","label":"(","value":"("},
  {"id":"v_2_4","type":"variable","label":"Tasa Anual","value":"tasa_anual"},
  {"id":"o4_5","type":"operator","label":"÷","value":"/"},
  {"id":"n_6","type":"number","label":"100","value":"100"},
  {"id":"o4_7","type":"operator","label":"÷","value":"/"},
  {"id":"n_8","type":"number","label":"12","value":"12"},
  {"id":"o6_9","type":"operator","label":")","value":")"},
  {"id":"o3_10","type":"operator","label":"x","value":"*"},
  {"id":"o5_11","type":"operator","label":"(","value":"("},
  {"id":"o5_12","type":"operator","label":"(","value":"("},
  {"id":"n_13","type":"number","label":"1","value":"1"},
  {"id":"o1_14","type":"operator","label":"+","value":"+"},
  {"id":"o5_15","type":"operator","label":"(","value":"("},
  {"id":"v_2_16","type":"variable","label":"Tasa Anual","value":"tasa_anual"},
  {"id":"o4_17","type":"operator","label":"÷","value":"/"},
  {"id":"n_18","type":"number","label":"100","value":"100"},
  {"id":"o4_19","type":"operator","label":"÷","value":"/"},
  {"id":"n_20","type":"number","label":"12","value":"12"},
  {"id":"o6_21","type":"operator","label":")","value":")"},
  {"id":"o6_22","type":"operator","label":")","value":")"},
  {"id":"o7_23","type":"operator","label":"^","value":"^"},
  {"id":"v_3_24","type":"variable","label":"Plazo (Meses)","value":"plazo"},
  {"id":"o6_25","type":"operator","label":")","value":")"},
  {"id":"o4_26","type":"operator","label":"÷","value":"/"},
  {"id":"o5_27","type":"operator","label":"(","value":"("},
  {"id":"o5_28","type":"operator","label":"(","value":"("},
  {"id":"n_29","type":"number","label":"1","value":"1"},
  {"id":"o1_30","type":"operator","label":"+","value":"+"},
  {"id":"o5_31","type":"operator","label":"(","value":"("},
  {"id":"v_2_32","type":"variable","label":"Tasa Anual","value":"tasa_anual"},
  {"id":"o4_33","type":"operator","label":"÷","value":"/"},
  {"id":"n_34","type":"number","label":"100","value":"100"},
  {"id":"o4_35","type":"operator","label":"÷","value":"/"},
  {"id":"n_36","type":"number","label":"12","value":"12"},
  {"id":"o6_37","type":"operator","label":")","value":")"},
  {"id":"o6_38","type":"operator","label":")","value":")"},
  {"id":"o7_39","type":"operator","label":"^","value":"^"},
  {"id":"v_3_40","type":"variable","label":"Plazo (Meses)","value":"plazo"},
  {"id":"o2_41","type":"operator","label":"-","value":"-"},
  {"id":"n_42","type":"number","label":"1","value":"1"},
  {"id":"o6_43","type":"operator","label":")","value":")"}
];

const expression = "monto * ( tasa_anual / 100 / 12 ) * ( ( 1 + ( tasa_anual / 100 / 12 ) ) ^ plazo ) / ( ( 1 + ( tasa_anual / 100 / 12 ) ) ^ plazo - 1 )";

async function attemptInsert() {
  let success = false;
  let attempts = 0;
  while (!success && attempts < 20) {
    try {
      await client.connect();
      const res = await client.query(`
        INSERT INTO formula_definition 
        (key, name, description, version, author, expression, canvas_json, created_at, updated_at) 
        VALUES 
        ('cuota_francesa', 'Cuota de Amortización Francesa', 'Calcula la cuota mensual fija (Amortización Francesa)', 1, 'Sistema', $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [expression, JSON.stringify(canvasJson)]);
      console.log('Inserted formula:', res.rowCount);
      success = true;
      await client.end();
    } catch(e) {
      if (e.code === '42P01') {
         console.log('Table not ready yet, retrying in 3s...');
         await client.end().catch(()=>{});
         client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });
         await new Promise(r => setTimeout(r, 3000));
         attempts++;
      } else {
         console.error(e);
         await client.end();
         break;
      }
    }
  }
}

attemptInsert();
