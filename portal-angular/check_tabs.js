const fs = require('fs'); 
const data = JSON.parse(fs.readFileSync('layout_Flujo_Credito_Completo.json', 'utf8')); 
console.log('Flujo_Credito_Completo tabs:', data.tabs ? data.tabs.length : 0);
const data2 = JSON.parse(fs.readFileSync('layout_flujo_negociacion_y_venta_(bizagi).json', 'utf8'));
console.log('flujo_negociacion_y_venta tabs:', data2.tabs ? data2.tabs.length : 0);
