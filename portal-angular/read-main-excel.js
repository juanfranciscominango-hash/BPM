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
            if (json.length > 1) console.log("Row 1:", json[1]);
            if (json.length > 2) console.log("Row 2:", json[2]);
            if (json.length > 3) console.log("Row 3:", json[3]);
            console.log(`Total Rows: ${json.length}`);
        }
    });
}

analyzeFile("C:\\ProyectosJava\\BMP\\Documentacion\\Negociacion y Venta\\Negociacion y Venta\\CH Negociación y Venta TO BE.xlsx");
