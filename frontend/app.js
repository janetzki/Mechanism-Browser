const express = require('express');
const cons = require('consolidate');
const path = require('path');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.engine('html', cons.mustache);
app.set('views', path.join(__dirname + '/public'));
app.set('view engine', 'html');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/mechanism/:id', function (req, res) {
    const xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'http://127.0.0.1:8000/api/mechanisms/?id=' + req.params['tagId']);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            const response = JSON.parse(xhttp.responseText);
            res.render('mechanism-article', response[0])
        }
    };
});

app.listen(8080);
