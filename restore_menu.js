const fs = require('fs');
const file = 'c:\\ProyectosJava\\BMP\\portal-angular\\src\\app\\features\\main-layout\\main-layout.scss';
let content = fs.readFileSync(file, 'utf8');

const target = `.nav-menu {
        list-style: none;
        padding: 0;
        margin: 0;
        flex: 1;

    }`;

const replace = `.nav-menu {
        list-style: none;
        padding: 0;
        margin: 0;
        flex: 1;

        .nav-item {
          margin-bottom: 0.25rem;

          .nav-link {
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
              padding-left: calc(#{$spacer-lg} + 8px);
            }

            &.active {
              background: var(--color-primary);
              color: $white;
              border-right: none;
            }

            i {
              font-size: 1.125rem;
              width: 24px;
              text-align: center;
              margin-right: $spacer-md;
              color: #6c757d;
            }

            &.active i {
              color: $white !important;
            }

            .nav-text {
              flex: 1;
              font-weight: 500;
            }

            &.active .nav-text {
              color: $white !important;
            }

            .submenu-arrow {
              font-size: 0.875rem;
              transition: transform 0.3s ease;
            }

            &.active .submenu-arrow {
              color: $white !important;
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
            background: rgba(0, 0, 0, 0.05);

            .submenu-link {
              display: block;
              padding: $spacer-sm calc(#{$spacer-lg} + 40px);
              color: #6c757d;
              text-decoration: none;
              font-size: 0.875rem;
              transition: all 0.3s ease;
              border-radius: 8px;
              margin: 0.1rem 1rem;

              &:hover {
                background: rgba(227, 6, 19, 0.1);
                color: var(--color-primary);
                padding-left: calc(#{$spacer-lg} + 48px);
              }
            }
          }
        }
    }`;

content = content.replace(target, replace);
fs.writeFileSync(file, content, 'utf8');
console.log('Restored and fixed .nav-menu block!');
