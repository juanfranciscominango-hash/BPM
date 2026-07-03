const fs = require('fs');
const {Client} = require('pg');

const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const backup = fs.readFileSync('c:/ProyectosJava/BMP/backup_inc_bpm_platform.sql', 'utf8');
        const lines = backup.split('\n');
        
        let inCopy = false;
        const rows = [];
        
        for(let line of lines) {
            if (line.startsWith('COPY public.screen_definition')) {
                inCopy = true;
                continue;
            }
            if (inCopy) {
                if (line.trim() === '\\.') break;
                // PostgreSQL COPY format: columns separated by \t
                const parts = line.split('\t');
                if (parts.length >= 6) {
                    rows.push({
                        id: parseInt(parts[0]),
                        is_default: parts[1] === 't',
                        layout_json: parts[2].replace(/\\\\/g, '\\').replace(/\\n/g, '\n'), // unescape
                        name: parts[3],
                        process_key: 'Flujo_Credito_Completo', // FORCE correct process key
                        task_key: parts[5].trim()
                    });
                }
            }
        }
        
        console.log(`Found ${rows.length} screens in backup.`);
        
        for (const row of rows) {
            // Check if exists
            const res = await client.query('SELECT id FROM screen_definition WHERE id = $1', [row.id]);
            if (res.rows.length === 0) {
                await client.query(
                    'INSERT INTO screen_definition (id, is_default, layout_json, name, process_key, task_key) VALUES ($1, $2, $3, $4, $5, $6)',
                    [row.id, row.is_default, row.layout_json, row.name, row.process_key, row.task_key]
                );
                console.log(`Restored screen ID ${row.id} (${row.name})`);
            } else {
                // Update process_key just in case
                await client.query('UPDATE screen_definition SET process_key = $1 WHERE id = $2', [row.process_key, row.id]);
            }
        }
        console.log("All screens restored!");
        
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
