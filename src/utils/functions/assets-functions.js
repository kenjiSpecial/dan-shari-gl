/**
 * load json file
 * @param {String} url
 */

export function getAjaxJson(url) {
	let promise = new Promise(function(resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		//    xhr.responseType = 'json';

		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					// console.log('xhr done successfully');

					var resp = xhr.responseText;
					var respJson = JSON.parse(resp);
					resolve(respJson);
				} else {
					reject(xhr.status);
					// console.log('xhr failed');
				}
			} else {
				// console.log('xhr processing going on');
			}
		};

		xhr.send();
	});

	return promise;
}

/**
 * load asset image
 *
 * @param {*} imageUrl
 */
export function getImage(imageUrl) {
	let promise = new Promise((resolve, reject) => {
		let image = new Image();
		image.onload = () => {
			resolve(image);
		};
		image.onerror = () => {
			reject('image is not loaded');
		};

		image.src = imageUrl;
	});

	return promise;
}
