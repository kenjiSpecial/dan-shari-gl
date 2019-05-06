/**
 * load json with ajax
 *
 * @param url url to load json file
 */
export function getAjaxJson(url: string, callback: Function) {
	const xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);

	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				const resp: string = xhr.responseText;
				const respJson = JSON.parse(resp);
				callback(respJson);
				// resolve(respJson);
			} else {
				// reject(xhr.status);
			}
		} else {
			// reject(xhr.status);
		}
	};

	xhr.send();
}

/**
 *
 * @param imageUrl
 */
export function getImage(imageUrl: string, callback: Function) {
	const image: HTMLImageElement = new Image();
	image.onload = () => {
		callback(image);
	};
	image.onerror = () => {
		console.warn(`image(${imageUrl}) load err`);
	};

	image.src = imageUrl;
}

/**
 *
 * @param dracoUrl
 * @param callback
 *
 * https://github.com/kioku-systemk/dracoSample/blob/5611528416d4e0afb10cbec52d70493602d8a552/dracoloader.js#L210
 *
 */
export function loadDraco(dracoUrl: string, callback: Function) {
	let xhr = new XMLHttpRequest();
	xhr.responseType = 'arraybuffer';
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			if (xhr.status === 200 || xhr.status === 0) {
				callback(xhr.response);
			} else {
				console.error("Couldn't load [" + dracoUrl + '] [' + xhr.status + ']');
			}
		}
	};
	xhr.open('GET', dracoUrl, true);
	xhr.send(null);
}
