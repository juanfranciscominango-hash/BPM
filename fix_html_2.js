const fs = require('fs');
const file = 'portal-angular/src/app/features/login/login.html';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<div class="small-logo-group d-flex flex-column align-items-end">
            <img src="assets/images/logo-chibuleo.png" onerror="this.style.display='none';" alt="Chibuleo" style="max-height: 40px; margin-bottom: 5px;" />
            <div class="small-logo-subtitle">COOPERATIVA DE AHORRO Y CRÉDITO</div>
           </div>`;

const replacement = `<div class="small-logo-group d-flex flex-column align-items-end">
            <img src="assets/images/logo-chibuleo.png" onerror="this.style.display='none'; document.getElementById('fallback-text').style.display='block';" alt="Chibuleo" style="max-height: 40px; margin-bottom: 5px;" />
            <span id="fallback-text" class="small-logo-text ms-2" style="display: none; color: #e30613;">Chibuleo</span>
            <div class="small-logo-subtitle">COOPERATIVA DE AHORRO Y CRÉDITO</div>
           </div>`;

content = content.replace(targetStr, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Added fallback text to right side logo');
