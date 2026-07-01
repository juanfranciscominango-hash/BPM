import re
import os

file_path = r'c:\ProyectosJava\BMP\portal-angular\src\app\features\simulacion\simulacion.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find type="number" inside <input> and replace with type="number" step="0.01" appTwoDecimals
new_content = re.sub(r'(<input[^>]*type="number"[^>]*)>', r'\1 step="0.01" appTwoDecimals>', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replacement complete.")
