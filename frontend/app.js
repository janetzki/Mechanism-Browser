const express = require('express');
const cons = require('consolidate');
const path = require('path');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function getMechanismAndRenderPage(req, res, page) {
    const xhttp = new XMLHttpRequest();
    xhttp.open('GET', 'http://mechanism-browser:8000/api/mechanisms/?id=' + req.params['id']);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            const response = JSON.parse(xhttp.responseText).results[0];
            response.rating = response.rating_likes - response.rating_dislikes;
            response.model = response.parametric_model;
            if (response.model !== undefined) {
                response.modelName = response.model.substring(response.model.lastIndexOf('/') + 1, response.model.length);
            }
            res.render(page, response)
        }
    };
}

function renderEmtpyPage(req, res, page) {
    const emptyMechanism = {
        name: '',
        comments: '',
        transmission: null,
        input: {
            r1: false,
            r2: false,
            r3: false,
            t1: false,
            t2: false,
            t3: false
        },
        output: {
            r1: false,
            r2: false,
            r3: false,
            t1: false,
            t2: false,
            t3: false
        },
        image: null,
        link: ''
    };
    res.render(page, emptyMechanism)
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
    getMechanismAndRenderPage(req, res, 'mechanism-article');
});

app.get('/mechanism/:id/edit', function (req, res) {
    getMechanismAndRenderPage(req, res, 'mechanism-article-edit');
});

app.get('/create', function (req, res) {
    renderEmtpyPage(req, res, 'mechanism-article-edit.html');
});

app.get('*icons/:name', function (req, res) {
    res.sendFile(__dirname + '/public/icons/' + req.params['name']);
});

app.listen(80);
