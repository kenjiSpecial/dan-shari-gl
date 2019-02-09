"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * load json with ajax
 *
 * @param url url to load json file
 */
function getAjaxJson(url) {
    return new Promise(function (resolve, reject) {
        // the resolve / reject functions control the fate of the promise
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        //    xhr.responseType = 'json';
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var resp = xhr.responseText;
                    var respJson = JSON.parse(resp);
                    resolve(respJson);
                }
                else {
                    reject(xhr.status);
                }
            }
            else {
                reject(xhr.status);
            }
        };
        xhr.send();
    });
}
exports.getAjaxJson = getAjaxJson;
/**
 *
 * @param imageUrl
 */
function getImage(imageUrl) {
    return new Promise(function (resolve, reject) {
        var image = new Image();
        image.onload = function () {
            resolve(image);
        };
        image.onerror = function () {
            reject('image is not loaded');
        };
        image.src = imageUrl;
    });
}
exports.getImage = getImage;
//# sourceMappingURL=assets-functions.js.map