// Use native fetch

async function seedRoles() {
    const baseUrl = 'http://localhost:9090/api/v1/security';
    
    // Fetch permissions first
    const permRes = await fetch(`${baseUrl}/permissions`);
    const permissions = await permRes.json();
    
    const getPerm = (code) => permissions.find(p => p.code === code);
    
    const roles = [
        { name: 'ASESOR_CREDITO', permissions: [] },
        { name: 'ANALISTA_RIESGO', permissions: [getPerm('ACCESO_REGLAS'), getPerm('ACCESO_PARAMETRICAS')] },
        { name: 'COMITE_CREDITO', permissions: [getPerm('ACCESO_MONITOREO')] },
        { name: 'OPERACIONES', permissions: [getPerm('ACCESO_PLANTILLAS')] },
        { name: 'GERENTE_SUCURSAL', permissions: [getPerm('ACCESO_MONITOREO'), getPerm('ACCESO_PARAMETRICAS')] }
    ];
    
    for (const role of roles) {
        // filter out undefined perms just in case
        role.permissions = role.permissions.filter(p => p);
        
        const res = await fetch(`${baseUrl}/roles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(role)
        });
        
        if (res.ok) {
            console.log(`Role ${role.name} created successfully`);
        } else {
            console.error(`Failed to create role ${role.name}`);
        }
    }
}

seedRoles();
