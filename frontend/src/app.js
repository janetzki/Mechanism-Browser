/**
 * @module webServer
 * @description The node server. Provides web pages and converts 3D model files.
 * @author Jonathan Janetzki
 */

const cons = require("consolidate");
const exec = require("child_process").exec;
const express = require("express");
const path = require("path");
const socketIo = require("socket.io");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

/**
 * Initializes the express application and the socket.io server
 */
function init() {
    initExpressApp(80);
    initSocketIoServer(8080);
}
init();

/**
 * Initializes the express application that serves as web server
 *
 * @param {number} port The port of the web server
 */
function initExpressApp(port) {
    const app = express();
    app.use(express.static(__dirname + "/public"));
    app.use("/bootstrap", express.static(path.join(__dirname, "../node_modules/bootstrap/dist/")));
    app.use("/jquery", express.static(path.join(__dirname, "../node_modules/jquery/dist/")));
    app.use("/socket.io", express.static(path.join(__dirname, "../node_modules/socket.io-client/dist/")));
    app.use("/jscad", express.static(path.join(__dirname, "../external/OpenJSCAD.org/packages/web/")));
    app.engine("html", cons.mustache);
    app.set("views", __dirname + "/public");
    app.set("view engine", "html");

    app.get("/", function (req, res) {
        res.sendFile(__dirname + "/public/pages/search/search.html");
    });
    app.get("/mechanism/:id", function (req, res) {
        retrieveMechanism(req.params["id"], res, renderPage, "pages/mechanism/mechanism-article/mechanism-article");
    });
    app.get("/mechanism/:id/edit", function (req, res) {
        retrieveMechanism(req.params["id"], res, renderPage, "pages/mechanism/mechanism-article-edit/mechanism-article-edit");
    });
    app.get("/create", function (req, res) {
        renderEmptyPage(res, "pages/mechanism/mechanism-article-edit/mechanism-article-edit");
    });
    app.get("*icons/:name", function (req, res) {
        res.sendFile(__dirname + "/public/icons/" + req.params["name"]);
    });

    app.listen(port);
}

/**
 * Initializes the socket.io server that converts 3D model files
 *
 * @param {number} port The port of the socket.io server
 */
function initSocketIoServer(port) {
    const io = socketIo.listen(port);
    io.sockets.on("connection", function (socket) {
        socket.on("convert", function (id) {
            socket.emit("received");
            retrieveMechanism(id, undefined, convertScadToJscad);
        });
    });
}



/**
 * Retrieves a mechanism from the Django backend by its id
 *
 * @param {number} id The id of the mechanism
 * @param {object} response The response to the browser
 * @param {function} callback The function to call with the mechanism
 * @param {object} callbackData Additional data that is passed to the callback function
 */
function retrieveMechanism(id, response, callback, callbackData) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://mechanism-browser:8000/api/mechanisms/?id=" + id);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            const mechanism = JSON.parse(xhttp.responseText).results[0];
            callback(response, mechanism, callbackData);
        }
    };
}

/**
 * Changes the extension of a file
 *
 * @param {string} fileName The name or path of the file
 * @param {string} newExtension The desired extension of the file
 * @param {string} expectedOldExtension The extension the file should have before changing it
 * @returns {string} The new file name
 */
function changeFileExtension(fileName, newExtension, expectedOldExtension = undefined) {
    let baseName = fileName;
    let fileExtension = "";
    const lastDotIndex = fileName.lastIndexOf(".");

    if (lastDotIndex > -1) {
        baseName = fileName.substring(0, lastDotIndex);
        fileExtension = fileName.substring(lastDotIndex + 1);
    }
    if (expectedOldExtension !== undefined && expectedOldExtension !== fileExtension) {
        console.warn("WARN: Expected file extension '" + expectedOldExtension +
            "' does not equal actual extension '" + fileExtension + "'");
        console.warn("WARN: for '" + fileName + "'");
    }

    return baseName + "." + newExtension;
}

/**
 * Fill/render a web page with a mechanism's properties
 *
 * @param {object} response The response to the browser
 * @param {object} mechanism The mechanism
 * @param {string} page The path to the page to be rendered
 */
function renderPage(response, mechanism, page) {
    if (mechanism !== undefined) {
        mechanism.rating = mechanism.rating_likes - mechanism.rating_dislikes;
        if (mechanism.parametric_model !== undefined) {
            mechanism.jscadModel = changeFileExtension(mechanism.parametric_model, "jscad", "scad");
            mechanism.modelName = mechanism.parametric_model.substring(
                mechanism.parametric_model.lastIndexOf("/") + 1,
                mechanism.parametric_model.length);
        }
        response.render(page, mechanism)
    } else {
        response.writeHead(302, {"Location": "/"});
        response.end();
    }
}

/**
 * Render a web page without any values
 *
 * @param {object} response The response to the browser
 * @param {string} page The path to the page to be rendered
 */
function renderEmptyPage(response, page) {
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
    response.render(page, emptyMechanism)
}

/**
 * Converts a scad file to a jscad file
 *
 * @param {object} response The reponse to the browser
 * @param {object} mechanism The mechanism
 */
function convertScadToJscad(response, mechanism) {
    if (mechanism.parametric_model !== undefined) {
        console.log("\nConvert 3D model of '" + mechanism.name + "' from scad to jscad...");

        mechanism.parametric_model = "public" + mechanism.parametric_model;
        const stlFileName = changeFileExtension(mechanism.parametric_model, "stl", "scad");
        const jscadFileName = changeFileExtension(stlFileName, "jscad", "stl");

        let command = "openscad " + mechanism.parametric_model + " -o " + stlFileName +
            " && openjscad " + stlFileName + " -o " + jscadFileName +
            " && rm " + stlFileName;
        console.log(command);

        exec(command, function (error, stdOut, stdErr) {
            if (error) {
                console.error(error);
                console.error(stdErr);
                return;
            }
            console.log("Done: " + jscadFileName + " created\n");
        });
    }
}
