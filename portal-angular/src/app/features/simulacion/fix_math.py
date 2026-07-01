import re

file_path = r'c:\ProyectosJava\BMP\portal-angular\src\app\features\simulacion\simulacion.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Function to replace the matched value calculation
def replace_calculation(match):
    # The full [value]="..." content
    expr = match.group(1)
    
    # We want to replace all instances of `simulacionForm.get('X')?.value` with `(+simulacionForm.get('X')?.value)`
    # This forces numerical conversion.
    # Actually, replacing `simulacionForm.get` with `(+simulacionForm.get` and `?.value` with `?.value)` might be tricky if there's `||0`
    
    # Let's replace `simulacionForm.get('something')?.value` with `(simulacionForm.get('something')?.value * 1)`
    expr_fixed = re.sub(r"(simulacionForm\.get\('[^']+'\)\?\.value)", r"(\1 * 1)", expr)
    
    return f'[value]="({expr_fixed}).toFixed(2)"'

# Find all [value]="..." that contain simulacionForm.get
new_content = re.sub(r'\[value\]="([^"]*simulacionForm\.get[^"]*)"', replace_calculation, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replacement complete.")
