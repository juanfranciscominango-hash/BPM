const fs = require('fs');
const file = 'portal-angular/src/app/features/main-layout/main-layout.scss';
let content = fs.readFileSync(file, 'utf8');

// The nav-link block
const navLinkTarget = `.nav-link {
            display: flex;
            align-items: center;
            padding: $spacer-md $spacer-lg;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: all 0.3s ease;
            border-radius: 0;
            position: relative;

            &:hover {
              background: rgba(255, 255, 255, 0.1);
              color: $white;
              padding-left: calc(#{$spacer-lg} + 8px);
            }`;

const navLinkReplace = `.nav-link {
            display: flex;
            align-items: center;
            padding: 0.8rem $spacer-md;
            color: #495057;
            text-decoration: none;
            transition: all 0.3s ease;
            border-radius: 8px;
            margin: 0.2rem 1rem;
            position: relative;

            &:hover {
              background: rgba(227, 6, 19, 0.1);
              color: var(--color-primary);
            }`;

content = content.replace(navLinkTarget, navLinkReplace);

// The active state block
const activeTarget = `&.active {
            .nav-link {
              background: rgba(255, 255, 255, 0.15);
              color: $white;
              border-left: 4px solid var(--color-accent);
              
              i {
                color: $white;
              }
            }
          }`;

const activeReplace = `&.active {
            .nav-link {
              background: var(--color-primary);
              color: $white;
              
              i, .nav-text, .submenu-arrow {
                color: $white !important;
              }
            }
          }`;

content = content.replace(activeTarget, activeReplace);

// The submenu links
const submenuTarget = `.submenu-link {
              display: block;
              padding: $spacer-sm calc(#{$spacer-lg} + 40px);
              color: rgba(255, 255, 255, 0.7);
              text-decoration: none;
              font-size: 0.875rem;
              transition: all 0.2s ease;

              &:hover, &.active {
                color: $white;
                background: rgba(255, 255, 255, 0.05);
              }
            }`;

const submenuReplace = `.submenu-link {
              display: block;
              padding: $spacer-sm calc(#{$spacer-lg} + 40px);
              color: #6c757d;
              text-decoration: none;
              font-size: 0.875rem;
              transition: all 0.2s ease;
              border-radius: 8px;
              margin: 0.1rem 1rem;

              &:hover, &.active {
                color: var(--color-primary);
                background: rgba(227, 6, 19, 0.1);
              }
            }`;

content = content.replace(submenuTarget, submenuReplace);

// Sidebar background
const sidebarTarget = `  // Sidebar Navigation
  .sidebar {
    width: 280px;
    background: var(--gradient-bgr);`;

const sidebarReplace = `  // Sidebar Navigation
  .sidebar {
    width: 280px;
    background: #ffffff;`;

content = content.replace(sidebarTarget, sidebarReplace);

fs.writeFileSync(file, content, 'utf8');
console.log('Sidebar patched successfully.');
