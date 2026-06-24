const baseUrl = 'http://localhost:9090/api/v1/meta';

async function cleanup() {
    console.log("Fetching all entities...");
    const res = await fetch(`${baseUrl}/entities`);
    const entities = await res.json();
    
    console.log(entities.map(e => ({id: e.id, name: e.name, label: e.label})));

    // Find the ones I created: credito_maestro and credito_interviniente
    const toDelete = entities.filter(e => e.name === 'credito_maestro' || e.name === 'credito_interviniente');
    
    if (toDelete.length === 0) {
        console.log("No duplicates found to delete.");
        return;
    }
    
    for (const entity of toDelete) {
        console.log(`Deleting entity: ${entity.name} (ID: ${entity.id})`);
        const delRes = await fetch(`${baseUrl}/entities/${entity.id}`, { method: 'DELETE' });
        if (delRes.ok) {
            console.log(`Successfully deleted ${entity.name}`);
        } else {
            console.error(`Failed to delete ${entity.name}`);
        }
    }
}

cleanup();
