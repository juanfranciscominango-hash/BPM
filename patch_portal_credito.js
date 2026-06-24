const fs = require('fs');
const fileHtml = 'portal-angular/src/app/features/portal-usuario/portal-credito-layout/portal-credito-layout.component.html';
let html = fs.readFileSync(fileHtml, 'utf8');

// Sidebar background
html = html.replace(/sidebar bg-dark text-white shadow-lg/g, 'sidebar bg-white text-dark shadow-sm');

// Sidebar header: Add red gradient, keep text white
html = html.replace(/sidebar-header d-flex align-items-center justify-content-between p-3 border-bottom border-secondary/g, 'sidebar-header d-flex align-items-center justify-content-between p-3 border-bottom border-light" style="background: var(--gradient-bgr);');
html = html.replace(/btn btn-sm btn-outline-light border-0/g, 'btn btn-sm text-white border-0');
html = html.replace(/text-primary/g, 'text-white'); // For the bank icon

// User info
html = html.replace(/user-info p-3 border-bottom border-secondary/g, 'user-info p-3 border-bottom border-light');
html = html.replace(/mb-0 fw-bold/g, 'mb-0 fw-bold text-dark');
html = html.replace(/text-white-50/g, 'text-muted');

// Nav links default state
html = html.replace(/nav-link text-muted/g, 'nav-link custom-nav-link text-secondary'); // replace from previous text-white-50 to text-muted if it happened
html = html.replace(/nav-link text-white-50/g, 'nav-link custom-nav-link text-secondary');

// Active state classes removal (handled by SCSS now)
const activeClasses = 'active text-white bg-secondary bg-opacity-25 border-start border-3 border-primary';
html = html.replace(new RegExp(activeClasses, 'g'), 'active');

// "Cerrar sesión" at the bottom
html = html.replace(/btn btn-link text-white-50/g, 'btn btn-link text-secondary text-decoration-none');

fs.writeFileSync(fileHtml, html, 'utf8');
console.log('HTML patched.');

// Now the SCSS
const fileScss = 'portal-angular/src/app/features/portal-usuario/portal-credito-layout/portal-credito-layout.component.scss';
let scss = fs.readFileSync(fileScss, 'utf8');

const scssTarget = `.sidebar-nav {
    flex-grow: 1;
    overflow-y: auto;
    
    .nav-link {
      transition: all 0.2s;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: white !important;
      }
      
      &.active {
        color: white !important;
      }
    }
  }`;

const scssReplace = `.sidebar-nav {
    flex-grow: 1;
    overflow-y: auto;
    
    .custom-nav-link {
      transition: all 0.3s ease;
      border-radius: 8px;
      margin: 0.2rem 1rem;
      
      &:hover {
        background: rgba(227, 6, 19, 0.1);
        color: var(--color-primary) !important;
      }
      
      &.active {
        background: var(--color-primary);
        color: white !important;
        
        i, span {
          color: white !important;
        }
      }
    }
  }`;

scss = scss.replace(scssTarget, scssReplace);

// The top header in main-content if it exists
if (scss.indexOf('.main-content {') !== -1) {
    // maybe it has a header too?
}

fs.writeFileSync(fileScss, scss, 'utf8');
console.log('SCSS patched.');
