declare namespace astroHTML.JSX {
  interface HTMLAttributes {
		/** Fragment/slide transition effect */
		effect?: string;
		/** Fragment/slide transition duration multiplier (default: 1) */
		duration?: string;
		/** Fragment/slide transition delay multiplier (default: 0) */
		delay?: string;
		/** Sets the element as a flex container with the given flow specifier (default: row) */
		flex?: string | boolean;
		/** Sets the element as a grid container with the given equally wide columns */
		grid?: string | boolean;
		w?: string;
		h?: string;
		top?: string;
		right?: string;
		bottom?: string;
		left?: string;
	}
  interface SVGAttributes {
		effect?: string;
	}
}
