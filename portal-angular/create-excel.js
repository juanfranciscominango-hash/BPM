const fs = require('fs');
const XLSX = require('xlsx');

// Create a new workbook
const wb = XLSX.utils.book_new();

// Create a simple worksheet with tags
const wsData = [
  ["TABLA DE AMORTIZACIÓN Y CRÉDITO"],
  [],
  ["Datos del Cliente"],
  ["Nombre Completo:", "<NombreCliente>"],
  ["Identificación:", "<CedulaRUC>"],
  ["Dirección:", "<Direccion>"],
  [],
  ["Datos del Crédito"],
  ["Monto Aprobado:", "<MontoAprobado>"],
  ["Tasa de Interés:", "<TasaInteres>"],
  ["Plazo (Meses):", "<Plazo>"]
];

const ws = XLSX.utils.aoa_to_sheet(wsData);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(wb, ws, 'Amortizacion');

// Write to file
XLSX.writeFile(wb, 'plantilla_amortizacion.xlsx');
console.log('Plantilla Excel creada exitosamente: plantilla_amortizacion.xlsx');
