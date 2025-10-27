import { LitElement, css, html, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import styles from '../styles/date-range.scss?raw';

@customElement('date-range')
export class DateRange extends LitElement {
	static styles = css`
		${unsafeCSS(styles)}
	`;
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };
	static formAssociated = true;

	@state() value = '/';

	@property({ reflect: true, attribute: 'value' }) defaultValue = '/';

	@property({ reflect: true, hasChanged: () => false }) name = '';

	@property({ reflect: true, type: Boolean }) required = false;

	@property({ reflect: true, type: Boolean }) disabled = false;

	@state() fieldsetDisabled = false;

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

	@query('input:first-of-type') start?: HTMLInputElement;
	@query('input:last-of-type') end?: HTMLInputElement;

	protected shouldUpdate(changes: PropertyValues<this>) {
		return !changes.has('value') || !this.hasUpdated || this.value !== this.#nativeValue || changes.size > 1;
	}

	protected willUpdate(changes: PropertyValues<this>) {
		if (changes.has('defaultValue')) {
			this.value = this.defaultValue;
		}
	}

	render() {
		const [start, end = ''] = this.value.split('/');
		const disabled = this.fieldsetDisabled || this.disabled;
		return html`<input
				type="date"
				part="date-picker"
				.disabled=${disabled}
				.value=${start}
				@change=${this.#forwardChange}
				@input=${this.#updateValueAndValidity}
			/>
			-<input
				type="date"
				part="date-picker"
				.disabled=${disabled}
				.value=${end}
				@change=${this.#forwardChange}
				@input=${this.#updateValueAndValidity}
			/>`;
	}

	protected updated(changes: PropertyValues<this>) {
		if (changes.has('value')) this.#updateValueAndValidity();
	}

	protected firstUpdated() {
		this.#updateValueAndValidity();
	}

	get #nativeValue() {
		return `${this.start!.value}/${this.end!.value}`;
	}

	#updateValueAndValidity = () => {
		if (!this.hasUpdated) return;
		const value = this.#nativeValue;
		this.value = value;
		this.#internals.setFormValue(value);
		const missStart = value.startsWith('/');
		const missEnd = value.endsWith('/');
		const valueMissing = this.required && (value.startsWith('/') || value.endsWith('/'));
		this.#internals.setValidity(
			{ valueMissing },
			valueMissing ? 'Please insert both start and end dates' : '',
			missStart ? this.start : missEnd ? this.end : undefined
		);
	};

	#forwardChange() {
		this.dispatchEvent(new Event('change', { bubbles: true }));
	}

	formAssociatedCallback = this.#updateValueAndValidity;

	formDisabledCallback(disabled: boolean) {
		this.fieldsetDisabled = disabled;
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
}
