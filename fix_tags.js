const fs = require('fs');
let content = fs.readFileSync('portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts', 'utf8');

// 1. Remove exactly 19 floating </div> at 2444-2462
content = content.replace(/(<\/div>\r?\n\s*){19}/, '');

// 2. Fix the missing </div> tags
content = content.replace(/<div style=\"width:4px;height:20px;border-radius:2px;background:linear-gradient\(135deg,#4f46e5,#7c3aed\);\">(?!\s*<\/div>)/g, '<div style=\"width:4px;height:20px;border-radius:2px;background:linear-gradient(135deg,#4f46e5,#7c3aed);\"></div>');

content = content.replace(/<i class=\"bi bi-info-circle-fill\"><\/i>\{\{\s*field\.label\s*\}\}\s*(<!-- BUTTON -->)/g, '<i class=\"bi bi-info-circle-fill\"></i>{{ field.label }}\n                          </div>\n\n                          $1');

content = content.replace(/(<\/button>\s*)(<!-- OTROS CONTROLES -->)/g, '$1                          </div>\n\n                          $2');

content = content.replace(/(<span class=\"input-group-text bg-light\"><i class=\"bi bi-hash text-muted\"><\/i><\/span>\s*)(<!-- MONEY -->)/g, '$1                            </div>\n\n                            $2');

content = content.replace(/(style=\"border-radius:0 10px 10px 0;\">\s*)(<!-- DATE -->)/g, '$1                            </div>\n\n                            $2');

content = content.replace(/(<label class=\"form-check-label text-muted ms-2\">\{\{\s*previewModel\[field\.name\]\s*\?\s*'Sí'\s*:\s*'No'\s*\}\}<\/label>\s*)(<!-- COMBO)/g, '$1                            </div>\n\n                            $2');

content = content.replace(/(<i class=\"bi bi-check-circle-fill me-1\"><\/i>\{\{\s*uploadedMockFiles\[field\.name\]\s*\}\}\s*)(<!-- IMAGE)/g, '$1                              </div>\n                            </div>\n\n                            $2');

content = content.replace(/(<span class=\"text-muted small\">\{\{\s*field\.label\s*\}\}<\/span>\s*)(<!-- GRID)/g, '$1                            </div>\n\n                            $2');

content = content.replace(/(<i class=\"bi bi-plus-lg text-indigo me-1\"><\/i>Añadir\s*<\/button>\s*)(<table)/g, '$1                              </div>\n                              $2');

fs.writeFileSync('portal-angular/src/app/features/plataforma/disenador-pantallas/disenador-pantallas.component.ts', content);
console.log('Fixed tags');
