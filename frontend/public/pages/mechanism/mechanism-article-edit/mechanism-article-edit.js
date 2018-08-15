const inputFields = {
    axes: ["inputR1", "inputR2", "inputR3", "inputT1", "inputT2", "inputT3", "outputR1", "outputR2", "outputR3", "outputT1", "outputT2", "outputT3"],
    notAxes: ["name", "link", "transmission", "image", "comments"]
};
let imageData = "";
let modelData = "";
let id, transmissionInverted, transmissionGuessed, complete;

window.onload = function () {
    initData();
    initInputs();
    initTransmissionInfo();
    initCompletedRow();
    previewImage();
};

function initData() {
    const dataElement = $($(".data")[0]);
    id = dataElement.data("id");
    transmissionInverted = dataElement.data("transmission-inverted");
    transmissionGuessed = dataElement.data("transmission-guessed");
    complete = dataElement.data("complete");
}

function initInputs() {
    const url = new URL(window.location.href);
    for (const axis of inputFields.axes) {
        const image = document.getElementById(axis);
        let status = image.dataset.status;
        if (url.searchParams.get(axis) === "1") {
            updateImageInput(image, 1);
        } else if (status === "true") {
            updateImageInput(image, 1)
        } else if (status === "false") {
            updateImageInput(image, 0)
        }
    }

    for (const inputField of inputFields.notAxes) {
        if (url.searchParams.get(inputField) !== null) {
            document.getElementById(inputField).value = url.searchParams.get(inputField);
        }
    }
}

function initTransmissionInfo() {
    if (transmissionInverted) {
        $("#transmissionInverted").prop("checked", " ");
    }
    if (transmissionGuessed) {
        $("#transmissionGuessed").prop("checked", " ");
    }
}

function initCompletedRow() {
    if (complete) {
        $("#complete").prop("checked", " ");
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

function toggleImage(img) {
    switch ($(img).data("status")) {
        case 1:
            updateImageInput(img, 0);
            break;
        default:
            // 0
            updateImageInput(img, 1);
    }
}

function previewImage() {
    const image = $("#image")[0];
    if (image.files && image.files[0]) {
        const reader = new FileReader();

        reader.onload = function (file) {
            $("#preview").attr("src", file.target.result);
        };

        reader.readAsDataURL(image.files[0]);
        imageData = image.files[0];
    }
}

function change3DModel() {
    const model = $("#3DModel")[0];
    if (model.files && model.files[0]) {
        const reader = new FileReader();
        reader.readAsDataURL(model.files[0]);
        modelData = model.files[0];
    }
}

function getParameters() {
    return {
        name: $("#name").val(),
        comments: $("#comments").val(),
        transmission: $("#transmission").val(),
        transmission_inverted: $("#transmissionInverted").prop("checked"),
        transmission_guessed: $("#transmissionGuessed").prop("checked"),
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
        image: imageData,
        parametric_model: modelData,
        link: $("#link").val(),
        complete: $("#complete").prop("checked")
    };
}

function getFormData() {
    const formData = new FormData();

    const parameters = getParameters();
    for (const key in parameters) {
        formData.append(key, parameters[key]);
    }

    return formData;
}

function showErrors(errors) {
    for (const inputField of inputFields.notAxes) {
        $("#" + inputField + "-errors").text("");
    }
    $("#non_field_errors-errors").text("");

    for (const inputField in errors) {
        $("#" + inputField + "-errors").text(errors[inputField]);
    }
}

function goBack() {
    window.location.href = "/mechanism/" + id;
}

function isNewArticle() {
    const urlParts = window.location.href.split("/").filter((string) => string);
    return urlParts[2] === "create"
}

function startConversionAndGoBack(id) {
    const socket = io.connect("http://mechanism-browser:8080");
    socket.emit("convert", id);
    socket.on("received", function () {
        window.location.href = "/mechanism/" + id;
    });
}

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
            startConversionAndGoBack(data.id);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            showErrors(jqXHR.responseJSON);
        }
    })
}
