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
