import re

file_path = r'c:\ProyectosJava\BMP\portal-angular\src\app\features\simulacion\simulacion.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the names inside the inline calculations
content = content.replace("simulacionForm.get('inmuebles')", "simulacionForm.get('activosInmuebles')")
content = content.replace("simulacionForm.get('vehiculos')", "simulacionForm.get('activosVehiculos')")
content = content.replace("simulacionForm.get('inversiones')", "simulacionForm.get('activosInversiones')")

content = content.replace("simulacionForm.get('saldoOtrosCreditos')", "simulacionForm.get('pasivosCreditos')")
content = content.replace("simulacionForm.get('saldoTarjetaCredito')", "simulacionForm.get('pasivosTarjetas')")
content = content.replace("simulacionForm.get('otrasDeudas')", "simulacionForm.get('pasivosOtrasDeudas')")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
