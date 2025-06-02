// index.js
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const port = process.env.PORT|| 5000;
const Approuter = require('./application');
app.use(cors()); 
app.use(express.json());
app.use(Approuter);


// Serve static files from the "public" folder
// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

console.log(`Server is running at http://localhost:${port}`);





