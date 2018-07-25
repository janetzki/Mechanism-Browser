const express = require("express");
const cons = require("consolidate");
const path = require("path");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.engine("html", cons.mustache);
app.set("views", path.join(__dirname + "/public"));
app.set("view engine", "html");


function getMechanismAndRenderPage(req, res, page) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://mechanism-browser:8000/api/mechanisms/?id=" + req.params["id"]);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            const response = JSON.parse(xhttp.responseText).results[0];
            if (response !== undefined) {
                response.rating = response.rating_likes - response.rating_dislikes;
                response.model = response.parametric_model;
                if (response.model !== undefined) {
                    response.modelName = response.model.substring(response.model.lastIndexOf("/") + 1, response.model.length);
                }
                res.render(page, response)
            } else {
                res.writeHead(302, {"Location": "/"});
                res.end();
            }
        }
    };
}

function renderEmptyPage(req, res, page) {
    const emptyMechanism = {
        name: "",
        comments: "",
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
        link: ""
    };
    res.render(page, emptyMechanism)
}

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/pages/search/search.html");
});

app.get("/mechanism/:id", function (req, res) {
    getMechanismAndRenderPage(req, res, "pages/mechanism/mechanism-article/mechanism-article");
});

app.get("/mechanism/:id/edit", function (req, res) {
    getMechanismAndRenderPage(req, res, "pages/mechanism/mechanism-article-edit/mechanism-article-edit");
});

app.get("/create", function (req, res) {
    renderEmptyPage(req, res, "pages/mechanism/mechanism-article-edit/mechanism-article-edit");
});

app.get("*icons/:name", function (req, res) {
    res.sendFile(__dirname + "/public/icons/" + req.params["name"]);
});

app.listen(80);
