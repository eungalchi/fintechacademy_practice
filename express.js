const express = require('express')
const app = express()
 
app.get('/', function (req, res) {
  res.send('Hello World')
})

app.get('/router01', function (req, res) {
    res.send('router01')
  })
 
app.listen(3000)