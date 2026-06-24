const baseUrlScreen = 'http://localhost:9090/api/v1/screens';

async function run() {
    const res = await fetch(baseUrlScreen);
    const screens = await res.json();
    
    // Find the one we created
    const myScreen = screens.find(s => s.processKey === 'Flujo_Credito_Completo' && s.taskKey === 'Task_1');
    if (myScreen) {
        myScreen.taskKey = "1. Revisar Perfil y Condicion";
        const saveRes = await fetch(baseUrlScreen, {
            method: 'POST', // POST handles save/update in spring data if ID is present
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(myScreen)
        });
        if (saveRes.ok) {
            console.log("Successfully updated taskKey to match task name!");
        } else {
            console.error("Failed to update", await saveRes.text());
        }
    } else {
        console.log("Screen not found.");
    }
}
run();
