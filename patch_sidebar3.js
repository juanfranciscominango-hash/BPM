const fs = require('fs');
const file = 'portal-angular/src/app/features/main-layout/main-layout.scss';
let content = fs.readFileSync(file, 'utf8');

// Replace nav-title color
content = content.replace(
  /color: rgba\(255, 255, 255, 0\.4\);/g,
  'color: #adb5bd;'
);

// Replace icon color
content = content.replace(
  /color: rgba\(255, 255, 255, 0\.7\);/g,
  'color: #6c757d;'
);

// Replace text-muted color in sidebar
content = content.replace(
  /color: rgba\(255, 255, 255, 0\.6\);/g,
  'color: #868e96;'
);

// Replace user name color
content = content.replace(
  /color: \$white;\s*margin-bottom: 2px;/g,
  'color: #212529;\n            margin-bottom: 2px;'
);

// Force active icon color
content = content.replace(
  /i, \.nav-text, \.submenu-arrow {\s*color: \$white !important;\s*}/g,
  `i, .nav-text, .submenu-arrow {
                color: $white !important;
              }`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Sidebar text colors patched.');
