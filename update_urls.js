const fs = require('fs');
const path = require('path');
const files = [
    'frontend/src/pages/Home.jsx',
    'frontend/src/pages/ItemDetails.jsx',
    'frontend/src/pages/PostItem.jsx',
    'frontend/src/pages/Dashboard.jsx',
    'frontend/src/context/AuthContext.jsx'
];
files.forEach(f => {
    const fp = path.join(__dirname, f);
    if (!fs.existsSync(fp)) return;
    let content = fs.readFileSync(fp, 'utf8');
    // For strings like 'http://localhost:5000/api/items'
    content = content.replace(/'http:\/\/localhost:5000(.*?)'/g, '`${import.meta.env.VITE_API_URL || \\'http://localhost:5000\\'}$1`');
        // For template literals like `http://localhost:5000/api/items/${id}`
        content = content.replace(/`http:\/\/localhost:5000(.*?)`/g, '`${import.meta.env.VITE_API_URL || \\'http://localhost:5000\\'}$1`');
            fs.writeFileSync(fp, content);
    console.log('Updated ' + f);
});
