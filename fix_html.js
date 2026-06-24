const fs = require('fs');
const file = 'portal-angular/src/app/features/login/login.html';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `onerror="this.src='https://www.chibuleo.com/wp-content/uploads/2023/10/logo-chibuleo.png'; this.style.filter='brightness(0) invert(1)';"`,
  `onerror="this.style.display='none';"`
);

content = content.replace(
  `onerror="this.src='https://www.chibuleo.com/wp-content/uploads/2023/10/logo-chibuleo.png';"`,
  `onerror="this.style.display='none';"`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed onerror infinite loop in login.html');
