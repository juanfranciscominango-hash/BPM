const {Client} = require('pg');
const client = new Client({user: 'postgres', host: 'localhost', database: 'INC_BPM_PLATFORM', password: 'Desarrollo', port: 5432});

async function run() {
    await client.connect();
    try {
        const res = await client.query("SELECT layout_json FROM screen_definition WHERE id = 30");
        let layout = JSON.parse(res.rows[0].layout_json);
        
        let targetTab = layout.tabs.find(t => t.title === 'Instrucción Operativa' || t.title === 'Instrucciones Operativas');
        if (!targetTab) {
            targetTab = { title: 'Instrucción Operativa', sections: [] };
            layout.tabs.push(targetTab);
        }
        
        targetTab.sections = [
            {
                title: "Seguros Desgravamen",
                fields: [
                    { name: "renuncia_seguro_desgravamen_deudor", label: "¿Renuncia Seguro Desgravamen Deudor?", controlType: "YESNO", cols: "12", required: false, readOnly: false, defaultValue: "", config: {} }
                ]
            },
            {
                title: "Renuncia Incendio",
                fields: [
                    { name: "renuncia_seguro_incendio", label: "¿Renuncia Seguro Incendio?", controlType: "YESNO", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "aseguradoras_seguro_incendios", label: "Aseguradoras Seguro de Incendios", controlType: "DROPDOWN", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} }
                ]
            },
            {
                title: "Instrucciones",
                fields: [
                    { name: "region_desembolso", label: "Región de Desembolso", controlType: "DROPDOWN", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "periodo_gracia", label: "Período de Gracia (meses)", controlType: "NUMBER", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "fecha_desembolso", label: "Fecha de Desembolso", controlType: "DATE", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "fecha_pago", label: "Fecha de Pago", controlType: "DROPDOWN", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "tasa", label: "Tasa", controlType: "NUMBER", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "monto_aprobado_inst", label: "Monto Aprobado", controlType: "MONEY", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "numero_expediente", label: "Número Expediente", controlType: "TEXTBOX", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "plazo_aprobado_inst", label: "Plazo Aprobado", controlType: "NUMBER", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "aplica_ley_vivienda", label: "¿Aplica Ley Vivienda?", controlType: "TEXTBOX", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "estimado_gastos_legales", label: "Estimado Gastos Legales", controlType: "MONEY", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "modificar_tabla", label: "Modificar Tabla", controlType: "TEXTBOX", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "valor_gastos_legales", label: "Valor Gastos Legales", controlType: "MONEY", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "requiere_cambio_monto", label: "¿Requiere Cambio de Monto?", controlType: "YESNO", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "garantia_tramite", label: "¿Garantía en Trámite?", controlType: "TEXTBOX", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "destino_credito_vivienda", label: "Destino Crédito Vivienda", controlType: "DROPDOWN", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "numero_aportantes", label: "Número Aportantes", controlType: "NUMBER", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "garantia_bien_adquirir", label: "Garantía bien adquirir", controlType: "YESNO", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "producto_credito_inst", label: "Producto Crédito", controlType: "TEXTBOX", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "destino_comercial_inst", label: "Destino Comercial", controlType: "TEXTBOX", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "nombre_proyecto_calificado", label: "Nombre Proyecto Calificado", controlType: "DROPDOWN", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "ingreso_banco", label: "Ingreso del Banco", controlType: "TEXTBOX", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "puntos_reajuste", label: "Puntos de Reajuste", controlType: "NUMBER", cols: "6", required: false, readOnly: false, defaultValue: "", config: {} },
                    { name: "observaciones", label: "Observaciones", controlType: "TEXTAREA", cols: "12", required: false, readOnly: false, defaultValue: "", config: {} }
                ]
            }
        ];
        
        await client.query("UPDATE screen_definition SET layout_json = $1 WHERE id = 30", [JSON.stringify(layout)]);
        console.log("Sections added to 'Instrucción Operativa' tab in ID 30");
        
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
