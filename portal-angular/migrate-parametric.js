const XLSX = require('xlsx');

const baseUrlMeta = 'http://localhost:9090/api/v1/meta';
const baseUrlParam = 'http://localhost:9090/api/v1/parametric';

async function migrateParametrics() {
    const filePath = "C:\\ProyectosJava\\BMP\\Documentacion\\Negociacion y Venta\\Negociacion y Venta\\Catalogo nuevos campos seccion consideraciones Negociacion y Venta.xlsx";
    const workbook = XLSX.readFile(filePath);

    // Track created tables to link them later
    const createdTables = {};

    for (const sheetName of workbook.SheetNames) {
        console.log(`\n--- Processing Catalog: ${sheetName} ---`);
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (json.length < 2) {
            console.log("Skipping empty catalog.");
            continue;
        }

        const rawHeader = json[0][0]; // Assuming single column catalogs for simplicity
        if (!rawHeader) continue;

        // 1. Create Table
        const cleanName = sheetName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);
        console.log(`Creating Parametric Table: ${cleanName}`);
        
        let tableRes = await fetch(`${baseUrlParam}/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "cat_" + cleanName,
                description: `Catálogo de ${sheetName}`
            })
        });

        if (!tableRes.ok) {
            console.error("Failed to create table", await tableRes.text());
            continue;
        }
        
        const table = await tableRes.json();
        createdTables[cleanName] = table.id;

        // 2. Create Column "valor"
        let colRes = await fetch(`${baseUrlParam}/tables/${table.id}/columns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "valor",
                label: rawHeader,
                type: "STRING"
            })
        });
        
        if (!colRes.ok) {
            console.error("Failed to create column", await colRes.text());
            continue;
        }

        // 3. Insert Data
        console.log(`Inserting ${json.length - 1} rows...`);
        let count = 0;
        for (let i = 1; i < json.length; i++) {
            const val = json[i][0];
            if (val) {
                await fetch(`${baseUrlParam}/tables/${table.id}/data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "valor": val.toString() })
                });
                count++;
            }
        }
        console.log(`Inserted ${count} rows.`);
    }

    // --- LINK TO ATTRIBUTES ---
    console.log("\n--- Linking to Meta Attributes ---");
    const entityIds = [12, 1]; // SOLICITUD_CREDITO, INTERVINIENTE

    for (const entityId of entityIds) {
        const getAttrRes = await fetch(`${baseUrlMeta}/entities/${entityId}/attributes`);
        if (!getAttrRes.ok) continue;
        const attrs = await getAttrRes.json();

        for (const attr of attrs) {
            // Simple heuristic to link
            // e.g. attr "tipo_de_actividad" matches table "tipo" (which might be too broad)
            // Let's do partial matches based on our known tables
            let matchTableId = null;
            
            if (attr.name.includes("exepcion") || attr.name.includes("excepcion")) {
                if (attr.name.includes("descripci")) matchTableId = createdTables["descripcion_exepciones"];
                else matchTableId = createdTables["exepcion"];
            } else if (attr.name.includes("tipo_de_actividad")) {
                matchTableId = createdTables["tipo"];
            } else if (attr.name.includes("autorizador")) {
                matchTableId = createdTables["autorizadores"];
            }

            if (matchTableId && !attr.parametricTableId) {
                console.log(`Linking attribute '${attr.name}' to Parametric Table ID: ${matchTableId}`);
                
                // Update attribute
                attr.parametricTableId = matchTableId;
                await fetch(`${baseUrlMeta}/attributes/${attr.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(attr)
                });
            }
        }
    }
    
    console.log("\nMigration Complete.");
}

migrateParametrics();
