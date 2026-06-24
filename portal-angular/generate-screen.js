const baseUrlMeta = 'http://localhost:9090/api/v1/meta';
const baseUrlScreen = 'http://localhost:9090/api/v1/screens'; // Wait, let's check what the screen API endpoint is.

async function run() {
    // 1. Get attributes for Entity 12
    const attrRes = await fetch(`${baseUrlMeta}/entities/12/attributes`);
    const attributes = await attrRes.json();
    
    console.log(`Loaded ${attributes.length} attributes for Solicitud de Crédito`);

    // Grouping logic:
    // Tab 1: Información del Cliente
    // Tab 2: Información del Crédito (Simulador)
    // Tab 3: Requisitos y Notificaciones
    
    const tabs = [
        { title: "Información General", sections: [] },
        { title: "Condiciones de Crédito", sections: [] },
        { title: "Excepciones y Consideraciones", sections: [] },
        { title: "Gestión Documental", sections: [] }
    ];

    // Simple heuristic to classify
    const secGeneral = { title: "Datos Principales", fields: [] };
    const secCliente = { title: "Datos del Cliente", fields: [] };
    
    const secCredito = { title: "Datos del Préstamo", fields: [] };
    const secIngresos = { title: "Ingresos y Egresos", fields: [] };
    
    const secExcep = { title: "Excepciones Detectadas", fields: [] };
    
    const secDoc = { title: "Gestión Documental", fields: [] };
    const secMisc = { title: "Otros Datos", fields: [] };

    for (const attr of attributes) {
        const name = attr.name.toLowerCase();
        let controlType = "TEXTBOX";
        if (attr.type === "INTEGER" || attr.type === "DOUBLE") controlType = "NUMBER";
        if (attr.type === "BOOLEAN") controlType = "CHECKBOX";
        if (attr.type === "DATE") controlType = "DATE";
        if (attr.parametricTableId) controlType = "COMBOBOX";

        const fieldDef = {
            name: attr.name,
            label: attr.label,
            controlType: controlType,
            cols: name.length > 20 ? 12 : 6,
            required: attr.required,
            parametricTableId: attr.parametricTableId
        };

        if (name.includes('cliente') || name.includes('nombre') || name.includes('cedula') || name.includes('identificacion')) {
            secCliente.fields.push(fieldDef);
        } else if (name.includes('monto') || name.includes('plazo') || name.includes('tasa') || name.includes('credito') || name.includes('cuota')) {
            secCredito.fields.push(fieldDef);
        } else if (name.includes('ingreso') || name.includes('egreso') || name.includes('salario') || name.includes('gasto')) {
            secIngresos.fields.push(fieldDef);
        } else if (name.includes('excepcion') || name.includes('exepcion') || name.includes('autorizador')) {
            secExcep.fields.push(fieldDef);
        } else if (name.includes('documento') || name.includes('respaldo') || name.includes('archivo') || name.includes('gestor_documental')) {
            secDoc.fields.push(fieldDef);
        } else if (name.includes('caso') || name.includes('fecha') || name.includes('estado') || name.includes('agencia')) {
            secGeneral.fields.push(fieldDef);
        } else {
            secMisc.fields.push(fieldDef);
        }
    }

    tabs[0].sections.push(secGeneral, secCliente);
    tabs[1].sections.push(secCredito, secIngresos);
    tabs[2].sections.push(secExcep);
    tabs[3].sections.push(secDoc, secMisc);

    const layout = {
        stepper: 1,
        tabs: tabs,
        ux: ['glassmorphism']
    };

    const screenDef = {
        name: "Pantalla Perfil y Condición",
        processKey: "Flujo_Credito_Completo",
        taskKey: "Task_1",
        layoutJson: JSON.stringify(layout),
        isDefault: false
    };

    console.log(JSON.stringify(layout, null, 2));

    const saveRes = await fetch(`${baseUrlScreen}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(screenDef)
    });

    if (saveRes.ok) {
        console.log("Screen Layout successfully generated and saved!");
    } else {
        console.error("Failed to save screen", await saveRes.text());
    }
}

run();
