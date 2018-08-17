/**
 * @module searchPage
 * @author Jonathan Janetzki
 */

const axes = ["R1", "R2", "R3", "T1", "T2", "T3"];
const matrixSize = axes.length;
const selectedMatrixCells = [...Array(matrixSize)].map(x => Array(matrixSize).fill(false));

/**
 * Initializes the matrix and the input events
 */
window.onload = function () {
    initMatrix();
    initInputEvents();
};

/**
 * Initializes the matrix by setting events when clicking on its cells. Also fills the matrix with data.
 */
function initMatrix() {
    const cells = document.getElementsByTagName("td");
    for (let i = 0; i < cells.length; i++) {
        cells[i].onclick = matrixClickHandler;
    }
    updateMatrix();
}

/**
 * Initializes events when interacting with the input buttons/images/forms
 */
function initInputEvents() {
    $("img[class=icon], input[type=number], input[type=search], input[type=radio]").on(
        "change keydown paste input click", function () {
        searchMechanisms();
        updateMatrix();
    });

    $("input[name='radioInputMode']").on("change click", function () {
        toggleInputMode();
    });
}



/**
 * Inserts arguments into a string at given placeholders
 * @example
 * // returns "3/10"
 * "{0}/{1}".format(3, 10)
 *
 * @returns {string} The formatted string
 */
String.prototype.format = function () {
    let string = this;
    for (const i in arguments) {
        string = string.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
    }
    return string
};

/**
 * Handles clicks on a matrix cell. See this [Stack Overflow post]{@link https://stackoverflow.com/a/12193346/8816968}.
 *
 * @param {object} event The click event
 */
function matrixClickHandler(event) {
    event = event || window.event;
    const cell = event.target || event.srcElement;
    const inputIndex = cell.parentNode.rowIndex - 2;
    const outputIndex = cell.cellIndex - 1;
    if (inputIndex >= 0 && outputIndex >= 0) {
        selectedMatrixCells[inputIndex][outputIndex] = !selectedMatrixCells[inputIndex][outputIndex];
        if (selectedMatrixCells[inputIndex][outputIndex]) {
            cell.style.border = "5px solid rgb(0, 162, 232)";
        } else {
            cell.style.border = "0px";
        }
        updateMatrix();
        searchMechanisms("http://mechanism-browser:8000/api/mechanisms/");
    }
}

/**
 * Sets an image for an axis
 *
 * @param {object} image The image as a DOM object
 * @param {string} filePrefix The prefix of image files for a specific axis
 * @param {(boolean|string)} status The new status of this axis (true: set, false: not set, "": not specified)
 * @param {boolean} triState A value that specifies whether the status parameter can be blank or not
 */
function setImage(image, filePrefix, status, triState = false) {
    filePrefix = filePrefix
        .replace("input", "")
        .replace("output", "")
        .toLowerCase();

    switch (status) {
        case true:
            image.src = "/media/icons/" + filePrefix + "_selected.png";
            break;
        case false:
            if (triState) {
                image.src = "/media/icons/" + filePrefix + "_deselected.png";
            } else {
                image.src = "media/icons/" + filePrefix + ".png";
            }
            break;
        default: // ""
            image.src = "media/icons/" + filePrefix + ".png";
    }
}

/**
 * Toggles the icon for an axis between three states (set, not set, not specified)
 *
 * @param {object} image The image as a DOM object
 */
function toggleAxisIcon(image) {
    switch ($(image).data("status")) {
        case true:
            $(image).data("status", false);
            break;
        case false:
            $(image).data("status", "");
            break;
        default: // ""
            $(image).data("status", true);
    }
    setImage(image, image.id, $(image).data("status"), true);
    updateMatrix();
}

/**
 * Tells whether a value is undefined or a blank string
 *
 * @param {(boolean|string)} value The value to be checked
 * @returns {boolean}
 */
function isUndefinedOrBlank(value) {
    return value === undefined || value === "";
}

/**
 * Fills the values of the matrix into a given dictionary
 *
 * @param {object} parameters A dictionary that holds search parameters
 */
function readMatrix(parameters) {
    for (let x = 0; x < matrixSize; x++) {
        for (let y = 0; y < matrixSize; y++) {
            const inputAxis = "input" + axes[y];
            const outputAxis = "output" + axes[x];
            if (selectedMatrixCells[y][x]) {
                if (isUndefinedOrBlank(parameters[inputAxis])) {
                    parameters[inputAxis] = true;
                }
                if (isUndefinedOrBlank(parameters[outputAxis])) {
                    parameters[outputAxis] = true;
                }
            }
        }
    }
}

/**
 * Removes all parameters that are undefined or blank
 *
 * @param {object} parameters A dictionary that holds search parameters
 */
function removeUndefinedParameters(parameters) {
    for (const key of Object.keys(parameters)) {
        if (isUndefinedOrBlank(parameters[key])) {
            delete parameters[key];
        }
    }
}

/**
 * Reads the search parameters from the input buttons/images/forms and matrix
 *
 * @returns {object} The search parameters as a dictionary
 */
function getParameters() {
    const parameters = {
        inputR1: $("#inputR1").data("status"),
        inputR2: $("#inputR2").data("status"),
        inputR3: $("#inputR3").data("status"),
        inputT1: $("#inputT1").data("status"),
        inputT2: $("#inputT2").data("status"),
        inputT3: $("#inputT3").data("status"),
        outputR1: $("#outputR1").data("status"),
        outputR2: $("#outputR2").data("status"),
        outputR3: $("#outputR3").data("status"),
        outputT1: $("#outputT1").data("status"),
        outputT2: $("#outputT2").data("status"),
        outputT3: $("#outputT3").data("status"),
        transmission: $("#transmission-value").val(),
        transmission_inverted: $("input[name='radioInverted']:checked").val(),
        transmission_guessed: $("input[name='radioGuessed']:checked").val(),
        name: $("#name").val(),
        parametric_model: $("input[name='radio3DModel']:checked").val(),
        complete: $("input[name='radioComplete']:checked").val()
    };

    if (document.getElementById("radioMatrixInput").checked) {
        readMatrix(parameters);
    }
    removeUndefinedParameters(parameters);
    return parameters;
}

/**
 * Builds an URL with given search parameters
 *
 * @param {string} baseUrl The URL without parameters
 * @param {object} parameters The search parameters as a dictionary
 * @returns {string} The URL with parameters
 */
function buildUrlWithParameters(baseUrl, parameters) {
    let url = new URL(baseUrl);
    for (const key of Object.keys(parameters)) {
        url.searchParams.append(key, parameters[key]);
    }
    return url.toString();
}

/**
 * Sets properties of a button that links to page listing search results
 *
 * @param {object} button The button as a DOM object
 * @param {boolean} activated A value that specifies whether the button can be clicked or not
 * @param {string} searchUrl The URL that is requested when clicking the button
 */
function setButtonStatus(button, activated, searchUrl) {
    button.disabled = !activated;
    button.setAttribute("onclick", "searchMechanisms('" + searchUrl + "')");
}

/**
 * Adjusts the size of the background when listing new search results
 */
function adjustBackground() {
    const documentHeight = document.getElementsByTagName("html")[0].offsetHeight;
    document.getElementById("content").style.display = "";
    document.getElementsByTagName("body")[0].style.height = "auto";
    document.getElementsByClassName("background")[0].style.minHeight = documentHeight + "px";
    document.getElementsByClassName("background-overlay")[0].style.minHeight = documentHeight + "px";
}

/**
 * Shows how many mechanisms have been found or offer to create one if there are no search results
 *
 * @param {number} searchResults The number of search results
 */
function showResultInfo(searchResults) {
    const resultInfo = document.getElementById("resultInfo");
    if (searchResults === 1) {
        resultInfo.innerText = "1 result";
    } else {
        resultInfo.innerText = searchResults + " results";
        if (searchResults === 0) {
            const url = buildUrlWithParameters("http://mechanism-browser/create/", getParameters());
            resultInfo.innerHTML = 'No results found. Do you want to <a href="' + url + '">create</a> it?';
        }
    }
}

/**
 * Shows the indices of the search result pages if there is more than one
 *
 * @param {string} first The link to the first page
 * @param {string} previous The link to the previous page
 * @param {string} current The link to the current page
 * @param {string} next The link to the next page
 * @param {string} last The link to the last page
 */
function showPageInfo(first, previous, current, next, last) {
    const pageInfo = document.getElementById("pageInfo");
    if (first === last) {
        pageInfo.style.display = "none";
        return;
    }
    pageInfo.style.display = "";

    const lastUrl = new URL(last);
    const pages = parseInt(lastUrl.searchParams.get("page"));
    const currentPage = current;

    document.getElementById("pageInfoText").textContent = "{0}/{1}".format(currentPage, pages);
    setButtonStatus(document.getElementById("firstPage"), currentPage !== 1, first);
    setButtonStatus(document.getElementById("previousPage"), previous !== null, previous);
    setButtonStatus(document.getElementById("nextPage"), next !== null, next);
    setButtonStatus(document.getElementById("lastPage"), currentPage !== pages, last);
}

/**
 * Shows the rating of a mechanism
 *
 * @param {object} entry A search result as a DOM object
 * @param {number} rating The rating of the mechanism
 */
function showRating(entry, rating) {
    const star = entry.querySelector("span.glyphicon-star");
    entry.querySelector("div.mechanism-rating").textContent = rating;
    if (rating < 0) {
        star.style.color = "red";
    } else if (rating === 0) {
        star.style.color = "grey";
    } else {
        star.style.color = "orange";
    }
}

/**
 * Shows the axes of a mechanism
 *
 * @param {object} entry A search result as a DOM object
 * @param {object} mechanism The mechanism
 */
function showAxes(entry, mechanism) {
    for (const axis of axes) {
        const inputImage = entry.querySelector("img.input" + axis);
        const outputImage = entry.querySelector("img.output" + axis);
        setImage(inputImage, "input" + axis, mechanism.input[axis.toLowerCase()]);
        setImage(outputImage, "output" + axis, mechanism.output[axis.toLowerCase()]);
    }
}

/**
 * Show a note that a mechanism is not complete if it is not
 *
 * @param {object} entry A search result as a DOM object
 * @param {boolean} complete A value whether the mechanism is complete or not
 */
function showCompleted(entry, complete) {
    if (complete === false) {
        entry.querySelector("p.mechanism-incomplete-note").style.display = "inline-block";
    }
}

/**
 * Appends a mechanism to the list of search results.
 * See this [Stack Overflow post]{@tutorial https://stackoverflow.com/a/41447500/8816968}.
 *
 * @param {object} mechanism The mechanism
 * @param {object} list The list of search results as a DOM object
 */
function appendSearchResult(mechanism, list) {
    const entry = document.querySelector("div[data-type='template']").cloneNode(true);

    entry.querySelector("a.mechanism-name").textContent = mechanism.name;
    entry.querySelector("a.mechanism-name").href = "mechanism/" + mechanism.id;
    entry.querySelector("a.mechanism-link").textContent = mechanism.link;
    entry.querySelector("a.mechanism-link").href = mechanism.link;
    entry.querySelector("div.mechanism-description").textContent = mechanism.comments;
    entry.querySelector("a.image-link").href = "mechanism/" + mechanism.id;
    entry.querySelector("img").src = mechanism.image.substring(1);
    showRating(entry, mechanism.rating_likes - mechanism.rating_dislikes);
    showAxes(entry, mechanism);
    showCompleted(entry, mechanism.complete);

    entry.style.display = "block";
    list.appendChild(entry);
}

/**
 * Lists all search results for one page
 *
 * @param {object} searchResults The search results as a dictionary
 */
function listSearchResults(searchResults) {
    adjustBackground();
    showResultInfo(searchResults.count);
    showPageInfo(searchResults.first, searchResults.previous, searchResults.current, searchResults.next, searchResults.last);

    const list = document.getElementById("mechanisms");
    list.innerHTML = "";
    for (const mechanismId of Object.keys(searchResults.results)) {
        const mechanism = searchResults.results[mechanismId];
        appendSearchResult(mechanism, list);
    }
}

/**
 * Retrieves search results from the Django backend
 *
 * @param baseUrl The backend URL without search parameters
 */
function searchMechanisms(baseUrl = "http://mechanism-browser:8000/api/mechanisms/") {
    const xhttp = new XMLHttpRequest();
    const url = buildUrlWithParameters(baseUrl, getParameters());
    xhttp.open("GET", url);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            const response = JSON.parse(xhttp.responseText);
            listSearchResults(response);
        }
    };
}

/**
 * Opens a page to create a new mechanism
 */
function createMechanism() {
    window.location.href = buildUrlWithParameters("http://mechanism-browser/create/", getParameters());
}

/**
 * Toggles between basic and matrix input for axes
 */
function toggleInputMode() {
    if (document.getElementById("radioMatrixInput").checked) {
        document.getElementById("inputColumn").style.display = "none";
        document.getElementById("outputColumn").style.display = "none";
        document.getElementById("matrixColumn").style.display = "";

        for (const io of ["input", "output"]) {
            for (const axis of axes) {
                const axisSelector = "#" + io + axis;
                const icon = $(axisSelector);
                icon.appendTo($(axisSelector + "Placeholder"));
                icon.css("marginBottom", "0px");
            }
        }
    } else {
        document.getElementById("inputColumn").style.display = "";
        document.getElementById("outputColumn").style.display = "";
        document.getElementById("matrixColumn").style.display = "none";

        for (const io of ["input", "output"]) {
            for (const axis of axes) {
                const axisSelector = "#" + io + axis;
                const icon = $(axisSelector);
                icon.appendTo($("#" + io + "Column"));
                icon.css("marginBottom", "20px");
            }
        }
    }
}

/**
 * Linearly interpolates between two values
 *
 * @param {number} value A value between 0 (inclusive) and 1 (inclusive)
 * @param {number} min The minimum value
 * @param {number} max The maximum value
 * @returns {number} The interpolated value
 */
function lerp(value, min, max) {
    return min + (max - min) * value;
}

/**
 * Tells whether a color is dark or not
 *
 * @param {number} r The red value
 * @param {number} g The green value
 * @param {number} b The blue value
 * @returns {boolean}
 */
function isDark(r, g, b) {
    return (r + g + b) / 3 < 130;
}

/**
 * Sets the color of a matrix cell
 *
 * @param {jQuery} cell The matrix cell
 * @param {number} value The value for the matrix cell
 * @param {number} maxValue The maximum value in the matrix
 */
function setCellColor(cell, value, maxValue) {
    let colorValue = 0.0;
    if (value > maxValue) {
        colorValue = 1.0;
    } else if (value > 0) {
        colorValue = Math.min(0.9, Math.max(0.1, value / maxValue));
    }

    const startR = 180;
    const startG = 225;
    const startB = 165;
    const endR = 35;
    const endG = 105;
    const endB = 60;
    const r = lerp(colorValue, startR, endR);
    const g = lerp(colorValue, startG, endG);
    const b = lerp(colorValue, startB, endB);

    $(cell).css("background-color", "rgb(" + r + ", " + g + ", " + b + ")");
    if (isDark(r, g, b)) {
        $(cell).css("color", "white");
    } else {
        $(cell).css("color", "black");
    }
}

/**
 * Finds the maximum value in the matrix
 *
 * @param {Array.<Array.<number>>} matrix The matrix
 * @returns {number} The maximum value
 */
function findMaxValueInMatrix(matrix) {
    let maxValue = 0;
    for (let x = 0; x < matrixSize; x++) {
        for (let y = 0; y < matrixSize; y++) {
            maxValue = Math.max(maxValue, matrix[y][x]);
        }
    }
    return maxValue;
}

/**
 * Sets the value and color for each matrix cell
 *
 * @param {Array.<Array.<number>>} matrix The matrix
 * @param {number} maxValue The maximum value in the matrix
 */
function setMatrixCells(matrix, maxValue) {
    for (let x = 0; x < matrixSize; x++) {
        for (let y = 0; y < matrixSize; y++) {
            const column = x + 1;
            const row = y + 2;
            const cell = $("#matrix")[0].rows[row].cells[column];
            cell.textContent = matrix[y][x];
            setCellColor(cell, matrix[y][x], maxValue);
        }
    }
}

/**
 * Updates the matrix by retrieving the new data from the Django backend
 */
function updateMatrix() {
    const xhttp = new XMLHttpRequest();
    const url = buildUrlWithParameters("http://mechanism-browser:8000/api/mechanisms/matrix/", getParameters());
    xhttp.open("GET", url);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            const matrix = JSON.parse(xhttp.responseText);
            const maxValue = findMaxValueInMatrix(matrix);
            setMatrixCells(matrix, maxValue);
        }
    };
}
