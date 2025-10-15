import styles from '../styles/date-range.scss?raw';

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles);

// @ts-ignore
const html = String.raw;

class DateRange extends HTMLElement {
	static formAssociated = true;

	static observedAttributes = ['value'];

	get value() {
		return `${this.#start.value}/${this.#end.value}`;
	}
	set value(value) {
		const [start, end] = String(value).split('/');
		this.#start.value = start;
		this.#end.value = end;
		this.#updateValueAndValidity();
	}

	get defaultValue() {
		return this.getAttribute('value') ?? '/';
	}
	set defaultValue(value) {
		this.value = value;
		this.setAttribute('value', value);
	}

	get name() {
		return this.getAttribute('name') ?? '';
	}
	set name(value) {
		this.setAttribute('name', value);
	}

	get required() {
		return this.hasAttribute('required');
	}
	set required(value) {
		this.toggleAttribute('required', value);
	}

	#fieldsetDisabled = false;

	get disabled() {
		return this.hasAttribute('disabled');
	}
	set disabled(value) {
		this.toggleAttribute('disabled', value);
		this.#setDisabledControls();
	}

	get form() {
		return this.#internals.form;
	}

	get willValidate() {
		return this.#internals.willValidate;
	}

	get validity() {
		return this.#internals.validity;
	}

	get validationMessage() {
		return this.#internals.validationMessage;
	}

	get labels() {
		return this.#internals.labels;
	}

	#internals = this.attachInternals();

	#start: HTMLInputElement;
	#end: HTMLInputElement;

	constructor() {
		super();
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.shadowRoot!.innerHTML = html`<input type="date" part="date-picker">-<input type="date" part="date-picker">`;
		[this.#start, this.#end] = this.shadowRoot!.querySelectorAll('input');
		this.shadowRoot!.addEventListener('input', this.#updateValueAndValidity);
		this.shadowRoot!.addEventListener('change', event => this.dispatchEvent(new Event('change', event)));
		this.shadowRoot?.adoptedStyleSheets.push(styleSheet);
	}

	attributeChangedCallback(name: string, _oldValue: string | null, value: string | null) {
		if (name === 'value') {
			this.value = value ?? '';
		}
	}

	formAssociatedCallback() {
		this.#updateValueAndValidity();
	}

	formDisabledCallback(disabled: boolean) {
		this.#fieldsetDisabled = disabled;
		this.#setDisabledControls();
	}

	formResetCallback() {
		this.value = this.defaultValue;
	}

	reportValidity() {
		return this.#internals.reportValidity();
	}

	checkValidity() {
		return this.#internals.checkValidity();
	}
	
	#setDisabledControls() {
		const disabledControls = this.#fieldsetDisabled || this.disabled;
		this.#start.disabled = disabledControls;
		this.#end.disabled = disabledControls;
	}

	#updateValueAndValidity = () => {
		const { value } = this;
		this.#internals.setFormValue(value);
		const missStart = value.startsWith('/');
		const missEnd = value.endsWith('/');
		const valueMissing = this.required && (value.startsWith('/') || value.endsWith('/'));
		this.#internals.setValidity(
			{ valueMissing },
			valueMissing ? 'Please insert both start and end dates' : '',
			missStart ? this.#start : (missEnd ? this.#end : undefined)
		);
	}
}

customElements.define('date-range', DateRange);