const express = require('express');
const cons = require('consolidate');
const path = require('path');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function getMechanismAndFillPage(req, res, page) {
    const xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'http://mechanism-browser:8000/api/mechanisms/?id=' + req.params['id']);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            const response = JSON.parse(xhttp.responseText);
            res.render(page, response.results[0])
        }
    };
}

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.engine('html', cons.mustache);
app.set('views', path.join(__dirname + '/public'));
app.set('view engine', 'html');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/mechanism/:id', function (req, res) {
    getMechanismAndFillPage(req, res, 'mechanism-article');
});

app.get('/mechanism/:id/edit', function (req, res) {
    getMechanismAndFillPage(req, res, 'mechanism-article-edit');
});

app.get('/create', function (req, res) {
    res.sendFile(__dirname + '/public/create.html');
});

app.get('*icons/:name', function (req, res) {
    res.sendFile(__dirname + '/public/icons/' + req.params['name']);
});

app.listen(80);
