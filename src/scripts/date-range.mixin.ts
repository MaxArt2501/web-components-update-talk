import styles from '../styles/date-range.scss?raw';
import { formAssociated } from './form-associated';

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles);

// @ts-ignore
const html = String.raw;

const { FormAssociatedElement, isDisabled, updateValueAndValidity } = formAssociated(HTMLElement, {
	defaultValue: '/',
	booleanAttributes: ['required'],
	validators: (instance: unknown) => {
		const dateRange = instance as DateRange
		return {};
	}
});

class DateRange extends FormAssociatedElement {
	static formAssociated = true;

	get value() {
		return `${this.#start.value}/${this.#end.value}`;
	}
	set value(value) {
		const [start, end] = String(value).split('/');
		this.#start.value = start;
		this.#end.value = end;
		super.value = value;
	}

	get disabled() {
		return super.disabled;
	}
	set disabled(value) {
		super.disabled = value;
		this.#setDisabledControls();
	}

	#start: HTMLInputElement;
	#end: HTMLInputElement;

	constructor() {
		super();
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.shadowRoot!.innerHTML = html`<input type="date" part="date-picker">-<input type="date" part="date-picker">`;
		[this.#start, this.#end] = this.shadowRoot!.querySelectorAll('input');
		this.shadowRoot!.addEventListener('input', () => updateValueAndValidity(this));
		this.shadowRoot!.addEventListener('change', event => this.dispatchEvent(new Event('change', event)));
		this.shadowRoot?.adoptedStyleSheets.push(styleSheet);
	}

	formDisabledCallback(disabled: boolean) {
		super.formDisabledCallback(disabled);
		this.#setDisabledControls();
	}

	#setDisabledControls() {
		const disabledControls = isDisabled(this);
		this.#start.disabled = disabledControls;
		this.#end.disabled = disabledControls;
	}
}

customElements.define('date-range', DateRange);