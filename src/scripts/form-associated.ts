interface Constructor<T> {
	new(...args: any[]): T;
	prototype: T;
}

type ValidatorFn = (instance: any) => Partial<Record<keyof ValidityStateFlags, string | { message: string, anchor?: HTMLElement }>>;

interface FormAssociatedElementOptions {
	stringAttributes?: string[]; 
	numberAttributes?: string[]; 
	booleanAttributes?: string[];
	validators?: ValidatorFn | ValidatorFn[];
	defaultValue?: string;
}

export const formAssociated = <T extends HTMLElement>(BaseClass: Constructor<T>, options: FormAssociatedElementOptions = {}) => {
	let getInternals: (instance: FormAssociatedElement) => ElementInternals;
	let isDisabled: (instance: FormAssociatedElement) => boolean;
	let updateValueAndValidity: (instance: FormAssociatedElement) => void;
	const defaultValue = options.defaultValue ?? '';

	class FormAssociatedElement extends (BaseClass as Constructor<HTMLElement> & { observedAttributes?: string[] }) {
		static formAssociated = true;

		static observedAttributes = [...super.observedAttributes ?? [], 'value']

		static {
			getInternals = instance => instance.#internals;
			isDisabled = instance => instance.#fieldsetDisabled || instance.disabled;
			updateValueAndValidity = instance => instance.#updateValueAndValidity();
		}

		#internals = this.attachInternals();

		#fieldsetDisabled = false;

		get value() {
			return defaultValue;
		}
		set value(_value) {
			this.#updateValueAndValidity();
		}

		get defaultValue() {
			return this.getAttribute('value') ?? defaultValue;
		}
		set defaultValue(value) {
			this.value = value;
			if (this.defaultValue !== value) {
				this.setAttribute('value', value);
			}
		}
		
		get name() {
			return this.getAttribute('name') ?? '';
		}
		set name(value) {
			this.setAttribute('name', value);
		}

		get disabled() {
			return this.hasAttribute('disabled');
		}
		set disabled(value) {
			this.toggleAttribute('disabled', value);
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

		attributeChangedCallback(name: string, _oldValue: string | null, value: string | null) {
			if (name === 'value') this.defaultValue = value ?? defaultValue;
		}

		formAssociatedCallback() {
			this.#updateValueAndValidity();
		}

		formDisabledCallback(disabled: boolean) {
			this.#fieldsetDisabled = disabled;
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

		#updateValueAndValidity = () => {
			const { value } = this;
			this.#internals.setFormValue(value);
			const validators = Array.isArray(options.validators) ? options.validators : options.validators ? [options.validators] : [];
			let message = '';
			let anchor: HTMLElement | undefined;
			const flags: ValidityStateFlags = {};
			for (const validator of validators) {
				for (const [flag, response] of Object.entries(validator(this))) {
					const msg = typeof response === 'string' ? response : response.message;
					const ncr = typeof response !== 'string' ? response.anchor : undefined;
					if (msg) {
						flags[flag as keyof ValidityStateFlags] = true;
						if (!message) {
							message = msg;
							anchor = ncr;
						}
					}
				}
			}
			this.#internals.setValidity(flags, message, anchor);
		}
	}
	Object.defineProperties(FormAssociatedElement.prototype, Object.fromEntries((options.stringAttributes ?? []).map(property => [property, {
		get(this: FormAssociatedElement) {
			return this.getAttribute(property);
		},
		set(this: FormAssociatedElement, value: string) {
			if (this.getAttribute(property) !== String(value)) {
				this.setAttribute(property, value);
			}
		}
	}])));
	Object.defineProperties(FormAssociatedElement.prototype, Object.fromEntries((options.booleanAttributes ?? []).map(property => [property, {
		get(this: FormAssociatedElement) {
			return this.hasAttribute(property);
		},
		set(this: FormAssociatedElement, value: boolean) {
			this.toggleAttribute(property, value);
		}
	}])));
	Object.defineProperties(FormAssociatedElement.prototype, Object.fromEntries((options.numberAttributes ?? []).map(property => [property, {
		get(this: FormAssociatedElement) {
			return Number(this.getAttribute(property));
		},
		set(this: FormAssociatedElement, value: number) {
			if (String(value) !== this.getAttribute(property)) {
				this.setAttribute(property, String(value));
			}
		}
	}])));

	return { FormAssociatedElement, getInternals, isDisabled, updateValueAndValidity };
};
