/**
 * load json with ajax
 *
 * @param url url to load json file
 */
export function getAjaxJson(url: string) {
	return new Promise((resolve: (val: string) => void, reject: (val: number) => void) => {
		// the resolve / reject functions control the fate of the promise
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		//    xhr.responseType = 'json';

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					const resp: string = xhr.responseText;
					const respJson = JSON.parse(resp);
					resolve(respJson);
				} else {
					reject(xhr.status);
				}
			} else {
				reject(xhr.status);
			}
		};

		xhr.send();
	});
}

/**
 *
 * @param imageUrl
 */
export function getImage(imageUrl: string) {
	return new Promise(
		(resolve: (val: HTMLImageElement) => void, reject: (val: string) => void) => {
			const image: HTMLImageElement = new Image();
			image.onload = () => {
				resolve(image);
			};
			image.onerror = () => {
				reject('image is not loaded');
			};

			image.src = imageUrl;
		}
	);
}
