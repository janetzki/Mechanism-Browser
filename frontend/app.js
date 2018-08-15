const cons = require("consolidate");
const exec = require("child_process").exec;
const express = require("express");
const path = require("path");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.engine("html", cons.mustache);
app.set("views", path.join(__dirname + "/public"));
app.set("view engine", "html");


function getMechanism(id, res, callback, callbackData) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://mechanism-browser:8000/api/mechanisms/?id=" + id);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            const response = JSON.parse(xhttp.responseText).results[0];
            callback(res, response, callbackData);
        }
    };
}

function changeFileExtension(fileName, newExtension, expectedOldExtension) {
    let baseName = fileName;
    let fileExtension = "";
    const lastDotIndex = fileName.lastIndexOf(".");

    if (lastDotIndex > -1) {
        baseName = fileName.substring(0, lastDotIndex);
        fileExtension = fileName.substring(lastDotIndex + 1);
    }
    if (expectedOldExtension !== undefined && expectedOldExtension !== fileExtension) {
        console.warn("Expected file extension '" + expectedOldExtension + "' does not equal actual extension '" + fileExtension);
    }

    return baseName + "." + newExtension;
}

function renderPage(res, response, page) {
    if (response !== undefined) {
        response.rating = response.rating_likes - response.rating_dislikes;
        if (response.parametric_model !== undefined) {
            response.jscadModel = changeFileExtension(response.parametric_model, "jscad", "scad");
            response.modelName = response.parametric_model.substring(response.parametric_model.lastIndexOf("/") + 1, response.parametric_model.length);
        }
        res.render(page, response)
    } else {
        res.writeHead(302, {"Location": "/"});
        res.end();
    }
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
    getMechanism(req.params["id"], res, renderPage, "pages/mechanism/mechanism-article/mechanism-article");
});

app.get("/mechanism/:id/edit", function (req, res) {
    getMechanism(req.params["id"], res, renderPage, "pages/mechanism/mechanism-article-edit/mechanism-article-edit");
});

app.get("/create", function (req, res) {
    renderEmptyPage(req, res, "pages/mechanism/mechanism-article-edit/mechanism-article-edit");
});

app.get("*icons/:name", function (req, res) {
    res.sendFile(__dirname + "/public/icons/" + req.params["name"]);
});

app.listen(80);


function convertScadToJscad(res, response, data) {
    if (response.parametric_model !== undefined) {
        response.parametric_model = "public" + response.parametric_model;
        const stlFileName = changeFileExtension(response.parametric_model, "stl", "scad");
        const jscadFileName = changeFileExtension(stlFileName, "jscad", "stl");

        let command = "openscad " + response.parametric_model + " -o " + stlFileName +
            " && openjscad " + stlFileName + " -o " + jscadFileName +
            " && rm " + stlFileName;
        console.log(command);

        exec(command, function (error, stdOut, stdErr) {
            if (error) {
                console.error(error);
                console.error(stdErr);
                return;
            }
            console.log("Done\n");
        });
    }
}

const io = require("socket.io").listen(8080); // initiate socket.io server

io.sockets.on("connection", function (socket) {
    socket.on("convert", function (id) {
        socket.emit("received");
        console.log("Convert 3D model of mechanism #" + id + " from scad to jscad...");
        getMechanism(id, undefined, convertScadToJscad);
    });
});
