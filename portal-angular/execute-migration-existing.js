const fs = require('fs');

async function migrate() {
    const schemaFile = fs.readFileSync('extracted_schema.json', 'utf8');
    const schema = JSON.parse(schemaFile);
    const baseUrl = 'http://localhost:9090/api/v1/meta';

    // Map extracted schema keys to existing entity IDs
    const entityMap = {
        'credito_maestro': 12, // solicitud_credito
        'credito_interviniente': 1 // interviniente
    };

    for (const [key, entityDef] of Object.entries(schema)) {
        const entityId = entityMap[key];
        console.log(`\nProcessing entity: ${entityDef.label} (Mapping to ID: ${entityId})...`);

        // Fetch existing attributes to avoid duplication
        const getAttrRes = await fetch(`${baseUrl}/entities/${entityId}/attributes`);
        let existingAttrs = [];
        if (getAttrRes.ok) {
            existingAttrs = await getAttrRes.json();
        }

        console.log(`Found ${existingAttrs.length} existing attributes. Migrating ${entityDef.attributes.length} new attributes...`);
        let count = 0;
        let skipped = 0;

        for (const attr of entityDef.attributes) {
            if (attr.name.length > 50) continue; // Skip very long names

            // Check if attribute already exists by name
            if (existingAttrs.some(e => e.name === attr.name)) {
                skipped++;
                continue;
            }

            const attrRes = await fetch(`${baseUrl}/attributes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: attr.name,
                    label: attr.label.substring(0, 50),
                    type: attr.type,
                    required: attr.required,
                    entity: { id: entityId }
                })
            });
            
            if (attrRes.ok) count++;
        }
        console.log(`Successfully created ${count} attributes. Skipped ${skipped} duplicates.`);
    }
}

migrate();
