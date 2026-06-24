const fs = require('fs');

function fixScreens(filename) {
    if (!fs.existsSync(filename)) return;
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    let modified = false;
    
    if (data.value && Array.isArray(data.value)) {
        for (let screen of data.value) {
            if (screen.id === 19 || screen.name === "Pantalla Perfil y Condición") {
                screen.taskKey = "Task_1";
                modified = true;
            }
            if (screen.id === 23 && screen.name === "Pantalla Simulación" && screen.processKey === "Flujo_Credito_Completo") {
                screen.taskKey = "Task_1_OLD";
                modified = true;
            }
        }
    }
    
    if (modified) {
        fs.writeFileSync(filename, JSON.stringify(data, null, 4));
        console.log("Fixed task keys in " + filename);
    }
}

fixScreens('c:/ProyectosJava/BMP/screens.json');
fixScreens('c:/ProyectosJava/BMP/screens2.json');
