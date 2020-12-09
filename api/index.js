const bodyParser = require('body-parser')
const app = require('express')()

app.use(bodyParser.json());

app.post('/date', (req, res) => {
    res.json({ kikou: "lol", req: req.body })
})

module.exports = app