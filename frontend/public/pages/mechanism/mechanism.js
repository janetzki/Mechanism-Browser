/*
 * @file JS code that is shared between multiple types of mechanism article pages
 * @author Jonathan Janetzki
 */


/**
 * Initializes the data
 */
function initData() {
    const dataElement = $($(".data")[0]);
    id = dataElement.data("id");
    transmissionInverted = dataElement.data("transmission-inverted");
    transmissionGuessed = dataElement.data("transmission-guessed");
    complete = dataElement.data("complete");
}

/**
 * Sets the icon for an axis
 *
 * @param {object} image The image as a DOM object
 * @param {boolean} status The status of this axis (true: set, false: not set)
 */
function setAxisIcon(image, status) {
    const baseFileName = image.id
        .slice(-2)
        .toLowerCase();

    $(image).data("status", status);
    if (status) {
        image.src = "icons/" + baseFileName + "_selected.png";
    } else {
        image.src = "icons/" + baseFileName + ".png";
    }
}
