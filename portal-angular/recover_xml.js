const {Client} = require('pg');
const fs = require('fs');

const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        // Find the XML from the deployed version 12 in Flowable
        const res = await client.query("SELECT b.BYTES_ FROM ACT_RE_PROCDEF p JOIN ACT_GE_BYTEARRAY b ON p.DEPLOYMENT_ID_ = b.DEPLOYMENT_ID_ WHERE p.KEY_ = 'Flujo_Credito_Completo' AND b.NAME_ LIKE '%.bpmn20.xml' AND p.VERSION_ = 12 LIMIT 1");
        
        if(res.rows.length > 0) {
            const originalXml = res.rows[0].bytes_.toString('utf8');
            fs.writeFileSync('c:/ProyectosJava/BMP/portal-angular/recovered_bpmn.xml', originalXml);
            console.log('Recovered to recovered_bpmn.xml');
            
            // Now rollback the process_definition table
            await client.query("UPDATE process_definition SET bpmn_xml = $1 WHERE key = 'flujo_negociacion_y_venta_(bizagi)'", [originalXml]);
            console.log("Rolled back process_definition!");

            // Rollback screen definitions
            await client.query("UPDATE screen_definition SET task_key = 'Activity_0c0o6m4' WHERE task_key = 'Task_7'");
            await client.query("UPDATE screen_definition SET task_key = 'Activity_1b63zyk' WHERE task_key = 'Task_3'");
            await client.query("UPDATE screen_definition SET task_key = 'Activity_1l39z22' WHERE task_key = 'Task_8'");
            await client.query("UPDATE screen_definition SET task_key = 'Activity_11vw4pv' WHERE task_key = 'Task_4'");
            console.log("Rolled back screen_definition!");
            
        } else {
            console.log('Not found in Flowable DB');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
