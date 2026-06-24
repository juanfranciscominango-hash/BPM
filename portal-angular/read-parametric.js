const XLSX = require('xlsx');

function analyzeFile(filePath) {
    console.log(`\n--- Analyzing ${filePath} ---`);
    const workbook = XLSX.readFile(filePath);
    const catalogs = [];

    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (json.length > 0) {
            catalogs.push({
                sheetName: sheetName,
                header: json[0][0],
                rowCount: json.length - 1,
                sample: json[1]
            });
        }
    });
    console.log(JSON.stringify(catalogs, null, 2));
}

analyzeFile("C:\\ProyectosJava\\BMP\\Documentacion\\Negociacion y Venta\\Negociacion y Venta\\Catalogo nuevos campos seccion consideraciones Negociacion y Venta.xlsx");
