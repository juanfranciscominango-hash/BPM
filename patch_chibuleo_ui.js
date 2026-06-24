const fs = require('fs');

// Patch SCSS
const scssFile = 'portal-angular/src/app/features/login/login.scss';
let scssContent = fs.readFileSync(scssFile, 'utf8');

// Replace background-color and add background image
scssContent = scssContent.replace(
  `  background-color: #e30613; // Chibuleo Red\n  display: flex;`,
  `  background-color: #e30613; // Chibuleo Red
  background-image: url('/assets/images/login-bg-chibuleo.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;`
);

// Add hero text CSS at the end of branding-section block (around line 72, before `environment-info`)
scssContent = scssContent.replace(
  `  .environment-info {`,
  `  .hero-text-container {
    text-align: left;
    color: #ffffff;
    
    .hero-subtitle {
      font-size: 1.3rem;
      font-weight: 500;
      margin-bottom: 0;
      letter-spacing: 0.5px;
    }

    .hero-title {
      font-size: 5rem;
      font-weight: 900;
      line-height: 0.9;
      letter-spacing: -2px;
      margin-top: 1rem;
      
      .bi-search {
        font-size: 3rem;
        vertical-align: middle;
      }
    }
  }

  .environment-info {`
);

fs.writeFileSync(scssFile, scssContent, 'utf8');
console.log('SCSS patched');

// Patch HTML
const htmlFile = 'portal-angular/src/app/features/login/login.html';
let htmlContent = fs.readFileSync(htmlFile, 'utf8');

const oldHtml = `<div class="branding-content">
        <div class="icon-group mb-4">
          <img src="assets/images/logo-chibuleo.png" onerror="this.style.display='none';" alt="Cooperativa Chibuleo" style="max-width: 300px; height: auto;" />
        </div>
        
        <h1 class="logo-text">Chibuleo</h1>
        <p class="logo-subtitle">COOPERATIVA DE AHORRO Y CRÉDITO</p>
      </div>`;

const newHtml = `<div class="branding-content text-start" style="width: 100%; max-width: 600px;">
        <div class="mb-5 pb-4">
          <img src="assets/images/logo-chibuleo.png" onerror="this.style.display='none'; document.getElementById('fallback-logo-left').style.display='block';" alt="Cooperativa Chibuleo" style="max-width: 300px; height: auto;" />
          <div id="fallback-logo-left" style="display: none;">
            <h1 class="logo-text" style="font-size: 3rem;">Chibuleo</h1>
            <p class="logo-subtitle" style="font-size: 0.8rem;">COOPERATIVA DE AHORRO Y CRÉDITO</p>
          </div>
        </div>
        
        <div class="hero-text-container">
          <p class="hero-subtitle">En COAC. Chibuleo estamos para ayudarte...</p>
          <h2 class="hero-title">¿Qué<br>podemos<br>hacer por ti<br>hoy ? <i class="bi bi-search"></i></h2>
        </div>
      </div>`;

htmlContent = htmlContent.replace(oldHtml, newHtml);
fs.writeFileSync(htmlFile, htmlContent, 'utf8');
console.log('HTML patched');
