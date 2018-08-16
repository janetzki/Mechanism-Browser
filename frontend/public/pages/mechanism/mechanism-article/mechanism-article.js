const axes = ["inputR1", "inputR2", "inputR3", "inputT1", "inputT2", "inputT3", "outputR1", "outputR2", "outputR3", "outputT1", "outputT2", "outputT3"];
let id, transmissionInverted, transmissionGuessed, complete;


window.onload = function () {
    initData();
    initImages();
    init3DModel();
    initTransmissionInfo();
    initIncompleteRow();
};

function initData() {
    const dataElement = $($(".data")[0]);
    id = dataElement.data("id");
    transmissionInverted = dataElement.data("transmission-inverted");
    transmissionGuessed = dataElement.data("transmission-guessed");
    complete = dataElement.data("complete");
}

function initImages() {
    for (const axis of axes) {
        const image = document.getElementById(axis);
        if (image.dataset.status === "true") {
            updateImageInput(image, 1)
        } else {
            updateImageInput(image, 0)
        }
    }
}

function init3DModel() {
    if ($("#3DModelLink").text() === "") {
        $(".model").hide();
    }
}

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

function initIncompleteRow() {
    if (!complete) {
        $("#incompleteRow").css("display", "table-row");
    }
}


function updateImageInput(img, status) {
    const baseFileName = img.id
        .slice(-2)
        .toLowerCase();

    $(img).data("status", status);
    switch (status) {
        case 1:
            img.src = "icons/" + baseFileName + "_selected.png";
            break;
        default:
            // 0
            img.src = "icons/" + baseFileName + ".png";
    }
}

function editArticle() {
    window.location.href += "/edit";
}

function sendVoting(voteUp) {
    let xhttp = new XMLHttpRequest();
    let url;
    const mechanismUrl = "http://mechanism-browser:8000/api/mechanisms/" + id + "/";
    if (voteUp) {
        url = mechanismUrl + "rate/1";
    } else {
        url = mechanismUrl + "rate/-1";
    }
    xhttp.open("GET", url);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            xhttp = new XMLHttpRequest();
            xhttp.open("GET", mechanismUrl);
            xhttp.send();
            xhttp.onreadystatechange = function () {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    const response = JSON.parse(xhttp.responseText);
                    document.getElementsByClassName("rating")[0].textContent = response.rating_likes - response.rating_dislikes;
                }
            };
        }
    };
}

function highlight(element, on) {
    if (on) {
        $(element).css("borderTopColor", "lightblue");
        $(element).css("borderBottomColor", "lightblue");
    } else {
        $(element).css("borderTopColor", "gray");
        $(element).css("borderBottomColor", "gray");
    }
}
