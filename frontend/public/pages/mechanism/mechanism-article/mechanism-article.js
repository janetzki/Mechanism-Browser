/*
 * @file JS code for the mechanism article page
 * @author Jonathan Janetzki
 */

const axes = ["inputR1", "inputR2", "inputR3", "inputT1", "inputT2", "inputT3", "outputR1", "outputR2", "outputR3", "outputT1", "outputT2", "outputT3"];
let id, transmissionInverted, transmissionGuessed, complete;

/**
 * Initializes and shows the data about a mechanism
 */
window.onload = function () {
    initData();
    initAxesIcons();
    initTransmissionInfo();
    initIncompleteRow();
    init3DModel();
};

/**
 * Shows the icons for the axes
 */
function initAxesIcons() {
    for (const axis of axes) {
        const image = document.getElementById(axis);
        setAxisIcon(image, image.dataset.status === "true");
    }
}

/**
 * Shows additional information about the transmission
 */
function initTransmissionInfo() {
    if (transmissionInverted || transmissionGuessed) {
        const info = $("#transmissionInfo");
        if (transmissionInverted) {
            info.text("Inverted");
        }
        if (transmissionGuessed) {
            let text = info.text();
            if (text === "") {
                text = "Guessed";
            } else {
                text += ", guessed";
            }
            info.text(text);
        }
    }
}

/**
 * Show a note that the mechanism is not complete if it is not
 */
function initIncompleteRow() {
    if (!complete) {
        $("#incompleteRow").css("display", "table-row");
    }
}

/**
 * Show the 3D model if there is one
 */
function init3DModel() {
    if ($("#3DModelLink").text() === "") {
        $(".model").hide();
    }
}



/**
 * Opens a page to edit this article
 */
function editArticle() {
    window.location.href += "/edit";
}

/**
 * Votes this article up or down by sending a vote to the Django backend
 *
 * @param {boolean} voteUp A value whether the vote is positive or negative
 */
function vote(voteUp) {
    const xhttp = new XMLHttpRequest();
    const mechanismUrl = "http://mechanism-browser:8000/api/mechanisms/" + id + "/";
    let url;
    if (voteUp) {
        url = mechanismUrl + "rate/1";
    } else {
        url = mechanismUrl + "rate/-1";
    }

    xhttp.open("GET", url);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            updateRating();
        }
    };
}

/**
 * Updates the rating of the article
 */
function updateRating() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://mechanism-browser:8000/api/mechanisms/" + id + "/");
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            const response = JSON.parse(xhttp.responseText);
            document.getElementsByClassName("rating")[0].textContent = response.rating_likes - response.rating_dislikes;
        }
    };
}

/**
 * Turns a highlight for an element on the page on or off
 *
 * @param {object} element The element as a DOM object
 * @param {boolean} on A value whether the highlight should be turned on or off
 */
function highlight(element, on) {
    if (on) {
        $(element).css("borderTopColor", "lightblue");
        $(element).css("borderBottomColor", "lightblue");
    } else {
        $(element).css("borderTopColor", "gray");
        $(element).css("borderBottomColor", "gray");
    }
}

/**
 * Opens the search page of the mechanism browser
 */
function goBack() {
    window.location.href = "/";
}
