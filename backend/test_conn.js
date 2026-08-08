const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://bellamkondapranav04e1_db_user:9UAR7JGHEiulbTBc@cluster0.asw4bmv.mongodb.net/campuscrate?appName=Cluster0')
    .then(() => { console.log('Connected! URL works.'); process.exit(0); })
    .catch((err) => { console.error('Failed to connect:', err); process.exit(1); })
