const http = require('http');

const req = (method, path, body) => new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
        hostname: 'localhost',
        port: 9091,
        path: path,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };
    const request = http.request(options, res => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
            if (responseBody && (responseBody.startsWith('{') || responseBody.startsWith('['))) {
                resolve(JSON.parse(responseBody));
            } else {
                resolve(responseBody);
            }
        });
    });
    request.on('error', reject);
    if (body) request.write(data);
    request.end();
});

async function run() {
    try {
        // Fetch current output tramas
        console.log("Fetching current output tramas...");
        const tramas = await req('GET', '/api/v1/api-manager/processes/1/tramas?type=OUTPUT');
        
        let rootId = null;
        for (const t of tramas) {
            if (t.name === '_Root') {
                rootId = t.id;
            } else {
                console.log(`Deleting old trama: ${t.name} (id: ${t.id})`);
                await req('DELETE', `/api/v1/api-manager/tramas/fields/${t.id}`);
            }
        }

        if (!rootId) {
            console.error("Error: Output _Root trama not found!");
            return;
        }

        console.log("Deleted old output tramas. Root ID is", rootId);

        // CREATE NEW OUTPUT FIELDS
        const newFields = [
            { processId: 1, tramaType: "OUTPUT", name: "interviniente_int_nombres_completos", parentId: rootId, defaultAssignment: "ASIGNAR SIEMPRE" },
            { processId: 1, tramaType: "OUTPUT", name: "interviniente_int_estado_civil", parentId: rootId, defaultAssignment: "ASIGNAR SIEMPRE" },
            { processId: 1, tramaType: "OUTPUT", name: "correo", parentId: rootId, defaultAssignment: "ASIGNAR SIEMPRE" },
            { processId: 1, tramaType: "OUTPUT", name: "telefono", parentId: rootId, defaultAssignment: "ASIGNAR SIEMPRE" },
            { processId: 1, tramaType: "OUTPUT", name: "fecha_nacimiento", parentId: rootId, defaultAssignment: "ASIGNAR SIEMPRE" },
            { processId: 1, tramaType: "OUTPUT", name: "valorMaximoPrestamo", parentId: rootId, defaultAssignment: "ASIGNAR SIEMPRE" }
        ];

        for (const f of newFields) {
            let res = await req('POST', '/api/v1/api-manager/tramas/fields', f);
            console.log("Created: ", res.name);
        }
        
        console.log("Done fixing tramas!");

    } catch (e) {
        console.error(e);
    }
}

run();
