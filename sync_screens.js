const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432 });

client.connect().then(async () => {
    try {
        const r24 = await client.query('SELECT layout_json FROM screen_definition WHERE id = 24');
        const jsonStr = r24.rows[0].layout_json;
        await client.query('UPDATE screen_definition SET layout_json = $1 WHERE id = 20', [jsonStr]);
        console.log('Updated Screen 20');
    } catch(e) {
        console.error(e.message);
    } finally {
        client.end();
    }
});
