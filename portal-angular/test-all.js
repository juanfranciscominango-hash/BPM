const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});
client.connect().then(() => {
    return client.query("SELECT layout_json FROM screen_definition WHERE process_key = 'Flujo_Credito_Completo' AND task_key = 'Activity_14xyo9t'");
}).then(res => {
    console.log(res.rows[0].layout_json.substring(0, 500));
    client.end();
}).catch(console.error);
