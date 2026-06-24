const fs = require('fs');
const file = 'portal-angular/src/app/features/main-layout/main-layout.scss';
let content = fs.readFileSync(file, 'utf8');

// The current broken block:
//     .sidebar-nav {
//       flex: 1;
// ...
//         .nav-item {
//     }
// 
//     .sidebar-footer {

const startIdx = content.indexOf('.sidebar-nav {');
const endIdx = content.indexOf('.sidebar-footer {');

if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `.sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
      display: flex;
      flex-direction: column;

      .nav-menu {
        list-style: none;
        padding: 0;
        margin: 0;
        flex: 1;

        .nav-item {
          margin-bottom: 0.25rem;

          .nav-link {
            display: flex;
            align-items: center;
            padding: 0.8rem 1.5rem;
            color: #495057;
            text-decoration: none;
            transition: all 0.3s ease;
            border-radius: 8px;
            margin: 0.2rem 1rem;
            position: relative;

            &:hover {
              background: rgba(227, 6, 19, 0.1);
              color: var(--color-primary);
              padding-left: calc(1.5rem + 8px);
            }

            &.active {
              background: var(--color-primary);
              color: #ffffff;
              border-right: none;
            }

            i {
              font-size: 1.125rem;
              width: 24px;
              text-align: center;
              margin-right: 1rem;
              color: #6c757d;
            }

            &.active i {
              color: #ffffff !important;
            }

            .nav-text {
              flex: 1;
              font-weight: 500;
            }

            &.active .nav-text {
              color: #ffffff !important;
            }

            .submenu-arrow {
              font-size: 0.875rem;
              transition: transform 0.3s ease;
            }

            &.active .submenu-arrow {
              color: #ffffff !important;
            }

            .badge {
              font-size: 0.7rem;
              padding: 0.25em 0.5em;
            }
          }

          &.has-submenu.open .nav-link .submenu-arrow {
            transform: rotate(180deg);
          }

          .submenu {
            list-style: none;
            padding: 0;
            margin: 0;
            background: rgba(0, 0, 0, 0.02);

            .submenu-link {
              display: block;
              padding: 0.5rem calc(1.5rem + 40px);
              color: #6c757d;
              text-decoration: none;
              font-size: 0.875rem;
              transition: all 0.3s ease;
              border-radius: 8px;
              margin: 0.1rem 1rem;

              &:hover, &.active {
                background: rgba(227, 6, 19, 0.1);
                color: var(--color-primary);
              }
            }
          }
        }
      }
    }

    `;

    content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Sidebar nav fixed.');
} else {
    console.log('Could not find boundaries.');
}
