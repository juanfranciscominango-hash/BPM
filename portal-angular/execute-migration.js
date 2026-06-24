const fs = require('fs');

async function migrate() {
    const schemaFile = fs.readFileSync('extracted_schema.json', 'utf8');
    const schema = JSON.parse(schemaFile);
    const baseUrl = 'http://localhost:9090/api/v1/meta';

    for (const [key, entityDef] of Object.entries(schema)) {
        console.log(`\nCreating entity: ${entityDef.label}...`);
        
        // Ensure entity does not already exist (skip logic)
        const getEntRes = await fetch(`${baseUrl}/entities`);
        const allEnts = await getEntRes.json();
        let entity = allEnts.find(e => e.tableName === key || e.name === key);

        if (!entity) {
            const createRes = await fetch(`${baseUrl}/entities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: key,
                    label: entityDef.label,
                    tableName: key,
                    description: entityDef.description || 'Migrado de Bizagi'
                })
            });
            if (createRes.ok) {
                entity = await createRes.json();
                console.log(`Created entity ID: ${entity.id}`);
            } else {
                console.error(`Failed to create entity ${key}`);
                continue;
            }
        } else {
            console.log(`Entity ${key} already exists (ID: ${entity.id}).`);
        }

        // Now create attributes
        console.log(`Creating ${entityDef.attributes.length} attributes...`);
        let count = 0;
        for (const attr of entityDef.attributes) {
            if (attr.name.length > 50) continue; // Skip very long names which are probably rules/buttons

            const attrRes = await fetch(`${baseUrl}/attributes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: attr.name,
                    label: attr.label.substring(0, 50),
                    type: attr.type,
                    required: attr.required,
                    entity: { id: entity.id }
                })
            });
            
            if (attrRes.ok) count++;
        }
        console.log(`Successfully created ${count} attributes for ${entityDef.label}`);
    }
}

migrate();
