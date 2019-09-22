"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * load json with ajax
 *
 * @param url url to load json file
 */
function getAjaxJson(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var resp = xhr.responseText;
                var respJson = JSON.parse(resp);
                callback(respJson);
                // resolve(respJson);
            }
            else {
                // reject(xhr.status);
            }
        }
        else {
            // reject(xhr.status);
        }
    };
    xhr.send();
}
exports.getAjaxJson = getAjaxJson;
/**
 *
 * @param imageUrl
 */
function getImage(imageUrl, callback) {
    var image = new Image();
    image.onload = function () {
        callback(image);
    };
    image.onerror = function () {
        console.warn("image(" + imageUrl + ") load err");
    };
    image.src = imageUrl;
}
exports.getImage = getImage;
/**
 *
 * @param dracoUrl
 * @param callback
 *
 * https://github.com/kioku-systemk/dracoSample/blob/5611528416d4e0afb10cbec52d70493602d8a552/dracoloader.js#L210
 *
 */
function loadDraco(dracoUrl, callback) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
                callback(xhr.response);
            }
            else {
                console.error("Couldn't load [" + dracoUrl + '] [' + xhr.status + ']');
            }
        }
    };
    xhr.open('GET', dracoUrl, true);
    xhr.send(null);
}
exports.loadDraco = loadDraco;
//# sourceMappingURL=assets-functions.js.map