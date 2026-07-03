const payload = {
    identificacion: "1700000003",
    nombres: "JUAN ANTONIO SANCHEZ RUIZ",
    estado_civil: "Casado/a",
    requiere_codeudor: false,
    tipo_credito: "Credito Hipotecario",
    producto: "VIP",
    monto: "17000",
    plazo: "200",
    cuota: "164.39",
    ingresos_totales: 3000,
    gastos_financieros: 150,
    din: 89.5,
    cin: 5.5,
    capacidad_pago: 1200,
    dti: 10.5,
    score_crediticio: 750,
    
    // new fields
    interviniente_int_identificacion: "1700000003",
    interviniente_int_nombre_completo: "JUAN ANTONIO SANCHEZ RUIZ",
    interviniente_int_estado_civil: "Casado/a",
    cin_valido: true,
    din_valido: true,
    producto_desc: "VIP",
    fecha_caso: "2026-06-29",
    fecha_solicitud: "29/6/2026, 8:49:13", // this is what toLocaleString might return
    monto_minimo: 1000,
    monto_maximo: 180000,
    plazo_minimo: 12,
    plazo_maximo: 240,
    plazo_solicitado_1: "200",
    plazo_solicitado_2: "200"
};

fetch('http://localhost:9091/api/v1/processes/flujo_negociacion_y_venta_(bizagi)/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
.then(async r => {
    console.log('Status:', r.status);
    console.log('Body:', await r.text());
})
.catch(console.error);
