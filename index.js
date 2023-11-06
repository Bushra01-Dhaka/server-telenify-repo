const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//middle wire
app.use(cors());
app.use(express.json());

app.get('/', async(req,res) => {
    res.send('Talenify server is running')
});

app.listen(port, () => {
    console.log(`Talenify is running on port: ${port}`);
})