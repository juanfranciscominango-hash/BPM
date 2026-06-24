const XLSX = require('xlsx');
const fs = require('fs');

function parseDictionary(filePath) {
    console.log(`\n--- Reading ${filePath} ---`);
    const workbook = XLSX.readFile(filePath);
    
    // Master entity and child entities
    const schema = {
        credito_maestro: {
            label: "Solicitud de Crédito",
            description: "Entidad central del crédito",
            attributes: new Map() // Using Map to deduplicate by name
        },
        credito_interviniente: {
            label: "Intervinientes",
            description: "Datos de clientes, codeudores y garantes",
            attributes: new Map()
        }
    };

    // Helper to sanitize field names for DB
    const sanitize = (name) => {
        if (!name) return null;
        const str = name.toString().trim();
        if (str.length > 50 || str.includes(' ')) {
            // Probably a sentence, but let's try to make a valid name if it's a real field that just has spaces
            if (str.length > 80) return null; // Definitely a sentence or rule
        }
        return str
            .toLowerCase()
            .replace(/[^\w\s_]/g, '') // Remove non-alphanumeric except spaces and underscores
            .replace(/\s+/g, '_');    // Replace spaces with underscores
    };

    // Helper to determine type
    const getType = (bizagiType) => {
        const typeStr = (bizagiType || '').toString().toLowerCase();
        if (typeStr.includes('fecha')) return 'DATE';
        if (typeStr.includes('entero') || typeStr.includes('número')) return 'INTEGER';
        if (typeStr.includes('moneda') || typeStr.includes('decimal')) return 'DECIMAL';
        if (typeStr.includes('booleano') || typeStr.includes('si/no')) return 'BOOLEAN';
        return 'STRING'; // default including Combo, Texto
    };

    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (json.length < 3) return; // Skip empty sheets

        // Find columns for "Campos" and "Tipo"
        let headerRowIdx = -1;
        let colCampo = -1;
        let colTipo = -1;

        for (let i = 0; i < Math.min(10, json.length); i++) {
            const row = json[i];
            if (!row) continue;
            for (let j = 0; j < row.length; j++) {
                const cell = row[j] ? row[j].toString().toLowerCase() : '';
                if (cell.includes('campos')) {
                    headerRowIdx = i;
                    colCampo = j;
                } else if (cell === 'tipo') {
                    colTipo = j;
                }
            }
            if (headerRowIdx !== -1) break;
        }
        
        if (headerRowIdx === -1 || colCampo === -1) {
            console.log(`Skipping sheet ${sheetName}: No 'Campos' header found.`);
            return; // Skip sheets that are just text/rules
        }

        if (colTipo === -1) colTipo = colCampo + 2; // fallback

        // Determine which entity this sheet belongs to
        let targetEntity = schema.credito_maestro;
        if (sheetName.toLowerCase().includes('intervin')) {
            targetEntity = schema.credito_interviniente;
        }

        for (let i = headerRowIdx + 1; i < json.length; i++) {
            const row = json[i];
            if (!row || row.length === 0) continue;
            
            const rawName = row[colCampo];
            if (!rawName || typeof rawName !== 'string' || rawName.includes('PESTAÑA:')) continue; // Skip group headers

            const fieldName = sanitize(rawName);
            if (!fieldName || fieldName.length < 2) continue;

            const rawType = row[colTipo];
            const dbType = getType(rawType);

            // Deduplication: Only add if not already in schema
            if (!targetEntity.attributes.has(fieldName)) {
                // Also check if it's already in the master entity so we don't duplicate across child/master (unless intended)
                if (targetEntity !== schema.credito_maestro && schema.credito_maestro.attributes.has(fieldName)) {
                    continue; // Already in master
                }

                targetEntity.attributes.set(fieldName, {
                    name: fieldName,
                    label: rawName.trim().substring(0, 100), // label limit
                    type: dbType,
                    required: false
                });
            }
        }
    });

    return schema;
}

const schema = parseDictionary("C:\\ProyectosJava\\BMP\\Documentacion\\Negociacion y Venta\\Negociacion y Venta\\CH Negociación y Venta TO BE.xlsx");

console.log("--- Extracted Schema ---");
for (const [key, entity] of Object.entries(schema)) {
    console.log(`Entity: ${key} (${entity.label})`);
    console.log(`Attributes count: ${entity.attributes.size}`);
    // Print first 5
    const attrs = Array.from(entity.attributes.values());
    console.log(attrs.slice(0, 5));
}

// Convert Maps to Arrays for JSON export
const exportData = {
    credito_maestro: { ...schema.credito_maestro, attributes: Array.from(schema.credito_maestro.attributes.values()) },
    credito_interviniente: { ...schema.credito_interviniente, attributes: Array.from(schema.credito_interviniente.attributes.values()) }
};

fs.writeFileSync('extracted_schema.json', JSON.stringify(exportData, null, 2));
console.log("\nSaved to extracted_schema.json");
