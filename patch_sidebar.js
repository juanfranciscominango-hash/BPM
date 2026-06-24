const fs = require('fs');
const file = 'portal-angular/src/app/features/main-layout/main-layout.scss';
let content = fs.readFileSync(file, 'utf8');

// 1. Sidebar background to white and text to gray
content = content.replace(
  /\.sidebar {\s*width: 280px;\s*background: var\(--gradient-bgr\);\s*box-shadow: 2px 0 10px var\(--shadow-color\);\s*transition: all 0\.3s ease;\s*position: fixed;\s*top: 0;\s*left: 0;\s*height: 100vh;\s*z-index: 1000;\s*overflow: hidden;/,
  `.sidebar {
    width: 280px;
    background: #ffffff; /* White background */
    box-shadow: 2px 0 10px var(--shadow-color);
    transition: all 0.3s ease;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    overflow: hidden;`
);

// 2. Sidebar header to Red
content = content.replace(
  /\.sidebar-header {\s*display: flex;\s*align-items: center;\s*justify-content: space-between;\s*padding: \$spacer-lg;\s*border-bottom: 1px solid rgba\(255, 255, 255, 0\.1\);\s*min-height: 70px;/,
  `.sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: $spacer-lg;
      background: var(--gradient-bgr); /* Red Header for the brand */
      min-height: 70px;`
);

// 3. Navigation items
// Find .nav-link and change its text color, hover, and active states
content = content.replace(
  /\.nav-link {\s*display: flex;\s*align-items: center;\s*padding: 0\.85rem \$spacer-lg;\s*color: rgba\(255, 255, 255, 0\.8\);\s*text-decoration: none;\s*transition: all 0\.2s ease;\s*position: relative;/,
  `.nav-link {
          display: flex;
          align-items: center;
          padding: 0.85rem $spacer-lg;
          color: #495057; /* Grey text */
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
          border-radius: 8px;
          margin: 0.2rem 1rem;`
);

content = content.replace(
  /&:hover {\s*background: rgba\(255, 255, 255, 0\.1\);\s*color: \$white;\s*}/,
  `&:hover {
            background: rgba(227, 6, 19, 0.1); /* Light red background on hover */
            color: var(--color-primary);
          }`
);

content = content.replace(
  /&\.active {\s*background: rgba\(255, 255, 255, 0\.15\);\s*color: \$white;\s*border-left: 4px solid var\(--color-accent\);\s*}/,
  `&.active {
            background: var(--color-primary); /* Solid red for active */
            color: $white;
            border-left: none;
            
            i { color: $white !important; }
            .nav-text { color: $white !important; }
          }`
);

// Menu section headers
content = content.replace(
  /\.nav-title {\s*font-size: 0\.75rem;\s*text-transform: uppercase;\s*letter-spacing: 1px;\s*color: rgba\(255, 255, 255, 0\.4\);\s*margin: \$spacer-md \$spacer-lg \$spacer-sm;\s*font-weight: 600;\s*}/,
  `.nav-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #adb5bd; /* Grey title */
          margin: $spacer-md $spacer-lg $spacer-sm;
          font-weight: 600;
        }`
);

// Sidebar footer user info
content = content.replace(
  /\.user-info {\s*overflow: hidden;\s*\.user-name {\s*display: block;\s*font-weight: 600;\s*font-size: 0\.95rem;\s*color: \$white;\s*margin-bottom: 2px;\s*white-space: nowrap;\s*}\s*\.user-role {\s*display: block;\s*font-size: 0\.75rem;\s*color: rgba\(255, 255, 255, 0\.6\);\s*text-transform: uppercase;\s*letter-spacing: 0\.5px;\s*white-space: nowrap;\s*}\s*}/,
  `.user-info {
          overflow: hidden;
          .user-name {
            display: block;
            font-weight: 600;
            font-size: 0.95rem;
            color: #212529; /* Dark text */
            margin-bottom: 2px;
            white-space: nowrap;
          }
          .user-role {
            display: block;
            font-size: 0.75rem;
            color: #6c757d; /* Grey text */
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
          }
        }`
);

// Footer border
content = content.replace(
  /border-top: 1px solid rgba\(255, 255, 255, 0\.1\);/,
  `border-top: 1px solid #e9ecef;`
);

// Icon color in nav link
content = content.replace(
  /i \{\s*font-size: 1\.25rem;\s*width: 24px;\s*text-align: center;\s*margin-right: \$spacer-sm;\s*transition: color 0\.2s ease;\s*color: rgba\(255, 255, 255, 0\.7\);\s*}/,
  `i {
            font-size: 1.25rem;
            width: 24px;
            text-align: center;
            margin-right: $spacer-sm;
            transition: color 0.2s ease;
            color: #6c757d;
          }`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Sidebar styles updated for white theme with red active states.');
