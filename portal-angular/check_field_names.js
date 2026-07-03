const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res30 = await client.query("SELECT layout_json FROM screen_definition WHERE id = 30");
        let layout30 = JSON.parse(res30.rows[0].layout_json);
        
        console.log("Existing fields in 'Instrucción Operativa' tab:");
        let targetTab = layout30.tabs.find(t => t.title === 'Instrucción Operativa' || t.title === 'Instrucciones Operativas');
        if (targetTab) {
            targetTab.sections.forEach(s => {
                if (s.title === 'Instrucciones') {
                    s.fields.forEach(f => console.log(`- ${f.name} (${f.label})`));
                }
            });
        }
        
        console.log("\nFields from 'Información General' (ID 30):");
        let infoTab = layout30.tabs.find(t => t.title === 'Información');
        if (infoTab) {
            infoTab.sections[0].fields.forEach(f => console.log(`- ${f.name} (${f.label})`));
        }

        console.log("\nFields from 'Aprobado Credito' (ID 30):");
        let aprobadoTab = layout30.tabs.find(t => t.title === 'Aprobado Credito');
        if (aprobadoTab) {
            aprobadoTab.sections[0].fields.forEach(f => console.log(`- ${f.name} (${f.label})`));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
