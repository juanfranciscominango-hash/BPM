const XLSX = require('xlsx');

function analyzeFile(filePath) {
    console.log(`\n--- Analyzing ${filePath} ---`);
    const workbook = XLSX.readFile(filePath);
    workbook.SheetNames.forEach(sheetName => {
        console.log(`\nSheet: ${sheetName}`);
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (json.length > 0) {
            console.log("Headers:", json[0]);
            console.log("First row of data:", json[1]);
        }
    });
}

analyzeFile("C:\\ProyectosJava\\BMP\\Documentacion\\Negociacion y Venta\\Negociacion y Venta\\Catalogo nuevos campos seccion consideraciones Negociacion y Venta.xlsx");
