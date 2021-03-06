(() => {

	const STORE_URL = "store.php"
	const LOAD_URL = "load.php"
	const FORM_ELEMENT = document.forms[0]
	const SHARE_BUTTON = document.getElementById("share")
	const RESTART_BUTTON = document.getElementById("restart")
	const MODAL_ELEMENT = document.getElementById("modal-shared")
	const MODAL_CLOSE_BUTTON = document.querySelector(".bx--modal-close")
	const SHARED_LINK_INPUT = document.getElementById("shared-link")
	const FROM_INPUT = document.getElementById("from")
	const RECAPTCHA_SITE_KEY = "6LcEduMUAAAAAB8eJXou15nBU_8PL_xDcFeuW2gh"

	init()

	function init() {
		// Google's reCAPTCHA initial action.
		grecaptcha.ready(() =>
			grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'form_view' })
		);

		window.addEventListener("hashchange", loadFormData)
		window.addEventListener("popstate", loadFormData)
		SHARE_BUTTON.addEventListener("click", handleShare)
		SHARED_LINK_INPUT.addEventListener("focus", fullSelect)
		SHARED_LINK_INPUT.addEventListener("click", fullSelect)
		MODAL_CLOSE_BUTTON.addEventListener("click", closeModal)
		RESTART_BUTTON.addEventListener("click", restart)

		for (const inputEl of FORM_ELEMENT.querySelectorAll("input, textarea")) {
			inputEl.addEventListener("input", handleFormChange)
		}

		for (const inputEl of FORM_ELEMENT.querySelectorAll("input.other")) {
			inputEl.addEventListener("change", handleOtherChange)
		}

		for (const inputEl of FORM_ELEMENT.querySelectorAll("input.other-content")) {
			inputEl.addEventListener("focus", handleOtherContentFocus)
			inputEl.addEventListener("blur", handleOtherContentBlur)
		}

		loadFormData();
	}

	/**
	 * This loads the form data, either from the server if URL's fragment is not empty (READ mode) or from local storage
	 * otherwise (WRITE mode).
	 */
	async function loadFormData() {
		closeModal()

		if (window.location.hash && window.location.hash.length > 1) {
			for (const inputEl of FORM_ELEMENT.querySelectorAll("input, textarea, button")) {
				if (inputEl.id !== "restart") {
					inputEl.setAttribute("disabled", "disabled")
				}
			}

			document.body.classList.add("filled")

			const params = new URLSearchParams(window.location.hash.substr(1))
			const { cipher, iv } = await serverLoad(params.get("id"))
			const key = await importSecretKey(params.get("key"))
			const data = await decryptMessage(key, iv, cipher)
			setFormData(data);
		}
		else {
			for (const inputEl of FORM_ELEMENT.querySelectorAll("input, textarea, button")) {
				inputEl.removeAttribute("disabled")
			}

			document.body.classList.remove("filled")

			if (localStorage["data"]) {
				setFormData(localStorage["data"]);
			}

			if (!(FROM_INPUT instanceof HTMLInputElement)) throw new Error("From input is not an input!")
			FROM_INPUT.select()
		}
	}

	/**
	 * This is the handler called when a user wants to save/share its form. It generates a cryptographic key, encrypts
	 * the message, store it on the server and shows a link for future access.
	 */
	async function handleShare() {
		const key = await window.crypto.subtle.generateKey({
			name: "AES-GCM",
			length: 256,
		},
			true,
			["encrypt", "decrypt"]
		)

		const encryptedMessage = await encryptMessage(key, getFormData())
		const id = await serverStore(encryptedMessage)

		const params = new URLSearchParams()
		params.set("id", id)
		params.set("key", await exportCryptoKey(key))

		if (!(SHARED_LINK_INPUT instanceof HTMLInputElement)) throw new Error("Shared link input is not an input!")
		SHARED_LINK_INPUT.value = window.location.href.split('#')[0] + "#" + params.toString()
		openModal()
		SHARED_LINK_INPUT.focus()
	}

	/**
	 * This simply ensure that the whole link is always selected when a user clicks on it.
	 *
	 * @param {Event} e 
	 */
	function fullSelect(e) {
		const inputEl = e.target
		if (!(inputEl instanceof HTMLInputElement)) return
		inputEl.select()
	}

	/**
	 * Saves the form data every time the user enters something.
	 *
	 * We might want to throttle this.
	 */
	function handleFormChange() {
		localStorage["data"] = getFormData();
	}

	/**
	 * Automatically focus the associated text field when a user select the “other” option for a question.
	 *
	 * @param {Event} e 
	 */
	function handleOtherChange(e) {
		const inputEl = e.target
		if (!(inputEl instanceof HTMLInputElement)) return
		const contentId = inputEl.dataset["content"]
		const contentEl = document.getElementById(contentId)
		if (!(contentEl instanceof HTMLInputElement)) return
		if (inputEl.checked) {
			if (contentEl !== document.activeElement) {
				contentEl.focus()
			}
		}

	}

	/**
	 * Automatically checks the associated boolean field when a user focuses the “other's content” field.
	 *
	 * @param {Event} e 
	 */
	function handleOtherContentFocus(e) {
		const contentEl = e.target
		if (!(contentEl instanceof HTMLInputElement)) return
		const inputId = e.target.dataset["contentOf"]
		const inputEl = document.getElementById(inputId)
		if (!(inputEl instanceof HTMLInputElement)) return
		inputEl.checked = true
		handleFormChange()
	}

	/**
	 * Automatically unchecks the associated boolean field if a user blur the “other's content” field and it is empty.
	 *
	 * @param {Event} e 
	 */
	function handleOtherContentBlur(e) {
		const contentEl = e.target
		if (!(contentEl instanceof HTMLInputElement)) return
		const inputId = e.target.dataset["contentOf"]
		const inputEl = document.getElementById(inputId)
		if (!(inputEl instanceof HTMLInputElement)) return
		if (!contentEl.value) inputEl.checked = false
		handleFormChange()
	}

	/**
	 * Reset form state.
	 */
	function restart() {
		// See https://stackoverflow.com/a/5298684
		history.pushState("",
			document.title,
			window.location.pathname + window.location.search)
		localStorage["data"] = undefined;
		window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
		loadFormData()
	}


	/*********/
	/* Modal */
	/*********/

	function openModal() {
		MODAL_ELEMENT.classList.add("is-visible")
	}

	function closeModal() {
		MODAL_ELEMENT.classList.remove("is-visible")
	}


	/********************/
	/* Form persistence */
	/********************/

	/**
	 * Returns the form content as a string.
	 */
	function getFormData() {
		const data = {}
		for (const [name, value] of new FormData(FORM_ELEMENT)) {
			const firstInput = document.getElementsByName(name)[0];
			if (firstInput instanceof HTMLInputElement) {
				switch (firstInput.type) {
					case "text":
					case "radio":
						data[name] = value;
						break;
					case "checkbox":
						if (!data[name]) data[name] = []
						data[name].push(value)
						break;
				}
			} else if (firstInput instanceof HTMLTextAreaElement) {
				data[name] = value;
			}
		}
		return JSON.stringify(data)
	}

	/**
	 * Sets the form data from a serialized value previously obtained form `getFormData()`.
	 * 
	 * @param {string} serialized
	 */
	function setFormData(serialized) {
		FORM_ELEMENT.reset()

		const data = JSON.parse(serialized)
		for (const [name, value] of Object.entries(data)) {
			const firstInput = document.getElementsByName(name)[0]
			if (firstInput instanceof HTMLInputElement) {
				switch (firstInput.type) {
					case "text":
						firstInput.value = value
						break;
					case "radio":
						setBooleanInput(name, value)
						break;
					case "checkbox":
						value.map(v => setBooleanInput(name, v))
						break;
				}
			} else if (firstInput instanceof HTMLTextAreaElement) {
				firstInput.value = value
			}
		}
	}

	/**
	 * Checks the boolean input with the given name and value attributes.
	 * 
	 * @param {string} name
	 * @param {string} value
	 */
	function setBooleanInput(name, value) {
		const input = document.querySelector("input[name='" + name + "'][value='" + value + "']")
		if (!(input instanceof HTMLInputElement)) throw new Error("")
		input.checked = true;
	}


	/***********************/
	/* Server-side storage */
	/***********************/

	/**
	 * Store the given data on the server and returns corresponding resource id.
	 *
	 * @param {object} data 
	 * @return {Promise<string>} resource id
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
	 */
	async function serverStore(data = {}) {
		const params = new URLSearchParams()
		params.set("data", JSON.stringify(data))

		const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'form_submit' })
		params.set("token", token)

		const body = params.toString()

		// Default options are marked with *
		const response = await fetch(STORE_URL, {
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			mode: 'no-cors', // no-cors, *cors, same-origin
			cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body
		});

		if (!response.ok) {
			throw new Error("Bad response.")
		}

		return (await response.json())["id"]
	}

	/**
	 * Load data corresponding to the given resource id from the server.
	 * @param {string} id
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
	 */
	async function serverLoad(id) {
		const response = await fetch(LOAD_URL + "?id=" + id, {
			mode: 'no-cors',
			cache: 'no-cache'
		})

		if (!response.ok) {
			throw new Error("Bad response.")
		}

		const result = await response.json()

		if (!result["iv"] || !result["cipher"]) {
			throw new Error("Bad response.")
		}

		return result;
	}


	/**********/
	/* Crypto */
	/**********/

	/**
	 * Get the encoded message, encrypt it and display a representation of the ciphertext in the "Ciphertext" element.
	 *
	 * @param {CryptoKey} key
	 * @param {string} message
	 * @see https://github.com/mdn/dom-examples/blob/master/web-crypto/encrypt-decrypt/aes-gcm.js
	 */
	async function encryptMessage(key, message) {
		const encoder = new TextEncoder()
		const messageEncoded = encoder.encode(message)

		// The iv must never be reused with a given key.
		const iv = window.crypto.getRandomValues(new Uint8Array(12));
		const cipher = await window.crypto.subtle.encrypt({
			name: "AES-GCM",
			iv: iv
		},
			key,
			messageEncoded
		);
		return {
			iv: arrayBufferToBase64(iv),
			cipher: arrayBufferToBase64(cipher)
		}
	}

	/**
	* Fetch the ciphertext and decrypt it. Write the decrypted message into the "Decrypted" box.
	*/
	async function decryptMessage(key, iv, cipher) {
		let decrypted = await window.crypto.subtle.decrypt(
			{
				name: "AES-GCM",
				iv: base64ToArrayBuffer(iv)
			},
			key,
			base64ToArrayBuffer(cipher)
		);

		const decoder = new TextDecoder();
		return decoder.decode(decrypted);
	}

	/**
	 * Export the given key and write it into the "exported-key" space.
	 *
	 * @param {CryptoKey} key
	 * @return {Promise<string>}
	 * @see https://github.com/mdn/dom-examples/blob/master/web-crypto/export-key/raw.js
	 */
	async function exportCryptoKey(key) {
		const exported = await window.crypto.subtle.exportKey(
			"raw",
			key
		)
		return arrayBufferToBase64(exported)
	}

	/**
	 * Import an AES secret key from an ArrayBuffer containing the raw bytes. Takes an ArrayBuffer string containing the
	 * bytes, and returns a Promise that will resolve to a CryptoKey representing the secret key.
	 *
	 * @param {any} base64
	 * @see https://github.com/mdn/dom-examples/blob/master/web-crypto/export-key/raw.js
	 */
	function importSecretKey(base64) {
		return window.crypto.subtle.importKey(
			"raw",
			base64ToArrayBuffer(base64),
			"AES-GCM",
			true,
			["encrypt", "decrypt"]
		);
	}

	/**
	 * Converts an array buffer to a base64-encoded string.
	 *
	 * @param {ArrayBuffer} buffer
	 * @see https://stackoverflow.com/a/9458996
	 */
	function arrayBufferToBase64(buffer) {
		const bytes = new Uint8Array(buffer)
		const len = bytes.byteLength
		let binary = ''
		for (let i = 0; i < len; ++i) {
			binary += String.fromCharCode(bytes[i])
		}
		return window.btoa(binary)
	}

	/**
	 * Converts an array buffer to a base64-encoded string.
	 *
	 * @param {string} base64
	 * @see https://stackoverflow.com/a/21797381
	 */
	function base64ToArrayBuffer(base64) {
		const binary_string = window.atob(base64)
		const len = binary_string.length
		const bytes = new Uint8Array(len)
		for (var i = 0; i < len; ++i) {
			bytes[i] = binary_string.charCodeAt(i)
		}
		return bytes.buffer;
	}
})();