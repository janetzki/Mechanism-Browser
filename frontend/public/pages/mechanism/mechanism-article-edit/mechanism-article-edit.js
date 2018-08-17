/*
 * @file JS code for the mechanism article editing page
 * @author Jonathan Janetzki
 */

const inputFields = {
    axes: ["inputR1", "inputR2", "inputR3", "inputT1", "inputT2", "inputT3", "outputR1", "outputR2", "outputR3", "outputT1", "outputT2", "outputT3"],
    notAxes: ["name", "link", "transmission", "image", "comments"]
};
let imageData = "";
let modelData = "";
let id, transmissionInverted, transmissionGuessed, complete;

/**
 * Initializes and shows the data about a mechanism
 */
window.onload = function () {
    initData();
    initInputsFromUrl();
    initTransmissionInfo();
    initCompletedRow();
    initDeleteButton();
    previewImage();
};

/**
 * Retrieves and shows parameters from the URL, which is relevant when a mechanism is created
 */
function initInputsFromUrl() {
    const url = new URL(window.location.href);

    for (const axis of inputFields.axes) {
        const image = document.getElementById(axis);
        let status = image.dataset.status;
        if (url.searchParams.get(axis) === "1") {
            setAxisIcon(image, true);
        } else if (status === "true") {
            setAxisIcon(image, true)
        } else if (status === "false") {
            setAxisIcon(image, false)
        }
    }

    for (const inputField of inputFields.notAxes) {
        if (url.searchParams.get(inputField) !== null) {
            document.getElementById(inputField).value = url.searchParams.get(inputField);
        }
    }
}

/**
 * Shows additional information about the transmission
 */
function initTransmissionInfo() {
    if (transmissionInverted) {
        $("#transmissionInverted").prop("checked", " ");
    }
    if (transmissionGuessed) {
        $("#transmissionGuessed").prop("checked", " ");
    }
}

/**
 * Shows whether the mechanism is complete or not
 */
function initCompletedRow() {
    if (complete) {
        $("#complete").prop("checked", " ");
    }
}

/**
 * Shows a button to delete the article if it was already created
 */
function initDeleteButton() {
    if (!isNewArticle()) {
        $("#delete").show();
    }
}



/**
 * Shows the image for the mechanism without uploading it
 */
function previewImage() {
    const image = $("#image")[0];
    if (image.files && image.files[0]) {
        const reader = new FileReader();

        reader.onload = function (file) {
            $("#preview").prop("src", file.target.result);
        };

        reader.readAsDataURL(image.files[0]);
        imageData = image.files[0];
    }
}

/**
 * Toggles an image of an axis between two states (set, not set)
 *
 * @param {object} image The image as a DOM object
 */
function toggleAxisIcon(image) {
    const newStatus = !$(image).data("status");
    setAxisIcon(image, newStatus);
}

/**
 * Changes the 3D model
 */
function change3DModel() {
    const model = $("#3DModel")[0];
    if (model.files && model.files[0]) {
        const reader = new FileReader();
        reader.readAsDataURL(model.files[0]);
        modelData = model.files[0];
    }
}

/**
 * Reads the parameters from the input buttons/images/forms
 *
 * @returns {object} The parameters as a dictionary
 */
function getParameters() {
    return {
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
        transmission: $("#transmission").val(),
        transmission_inverted: $("#transmissionInverted").prop("checked"),
        transmission_guessed: $("#transmissionGuessed").prop("checked"),
        name: $("#name").val(),
        parametric_model: modelData,
        complete: $("#complete").prop("checked"),
        comments: $("#comments").val(),
        image: imageData,
        link: $("#link").val()
    };
}

/**
 * Converts the parameters to form data
 *
 * @returns {FormData} The parameters as form data
 */
function getFormData() {
    const formData = new FormData();

    const parameters = getParameters();
    for (const key in parameters) {
        formData.append(key, parameters[key]);
    }

    return formData;
}

/**
 * Shows errors regarding the parameters from the Django backend
 *
 * @param {object} errors The errors as a dictionary
 */
function showErrors(errors) {
    for (const inputField of inputFields.notAxes) {
        $("#" + inputField + "-errors").text("");
    }
    $("#non_field_errors-errors").text("");

    for (const inputField in errors) {
        $("#" + inputField + "-errors").text(errors[inputField]);
    }
}

/**
 * Tells whether this article has not been created yet
 *
 * @returns {boolean}
 */
function isNewArticle() {
    const urlParts = window.location.href.split("/").filter((string) => string);
    return urlParts[2] === "create"
}

/**
 * Opens the search page or the mechanism article if it was already created
 *
 * @param {boolean} toSearchPage A value whether the search page should be opened anyway
 */
function goBack(toSearchPage = false) {
    if (toSearchPage || isNewArticle()) {
        window.location.href = "/";
    } else {
        window.location.href = "/mechanism/" + id;
    }
}

/**
 * Starts a conversion of the 3D model in the node backend and leaves the page as soon as the request was received
 */
function startConversionAndGoBack() {
    const socket = io.connect("http://mechanism-browser:8080");
    socket.emit("convert", id);
    socket.on("received", function () {
        goBack();
    });
}

/**
 * Creates or updates the article by sending a request to the Django backend
 */
function createOrUpdateArticle() {
    let url = "http://mechanism-browser:8000/api/mechanisms/" + id + "/";
    let method = "PATCH";
    if (isNewArticle()) {
        url = "http://mechanism-browser:8000/api/mechanisms/create/";
        method = "POST";
    }

    $.ajax({
        url: url,
        type: method,
        data: getFormData(),
        processData: false,
        contentType: false,
        success: function (data, textStatus, jqXHR1) {
            id = data.id;
            startConversionAndGoBack();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            showErrors(jqXHR.responseJSON);
        }
    })
}

/**
 * Deletes the article by sending a request to the Django backend
 */
function deleteArticle() {
    $.ajax({
        url: "http://mechanism-browser:8000/api/mechanisms/" + id + "/",
        type: "DELETE",
        success: function (data, textStatus, jqXHR1) {
            goBack(true);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(textStatus);
        }
    })
}
