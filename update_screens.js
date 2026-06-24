const fs = require('fs');
const data = JSON.parse(fs.readFileSync('screens.json', 'utf8'));

const screen = data.value.find(s => s.id === 20 || s.name.includes("Perfil y Condic"));
if (screen) {
    const layout = JSON.parse(screen.layoutJson);
    
    // Add Simulador to the first tab
    if (layout.tabs && layout.tabs.length > 0) {
        layout.tabs.unshift({
            title: "Simulador Interactivo",
            sections: [
                {
                    title: "Simulación de Crédito",
                    fields: [
                        {
                            name: "ctrl_simulador_1",
                            label: "Simulador",
                            controlType: "SIMULADOR",
                            cols: 12,
                            required: false,
                            readOnly: false
                        }
                    ]
                }
            ]
        });
        
        screen.layoutJson = JSON.stringify(layout);
        fs.writeFileSync('screens.json', JSON.stringify(data, null, 2));
        console.log("Updated screens.json successfully.");
    }
} else {
    console.log("Screen not found.");
}
