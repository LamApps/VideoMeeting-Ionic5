import { AbstractControl } from '@angular/forms';

export function matchingValidator(targetField: string, control: AbstractControl) {
	// parent is not initially defined, so we need to check if parent is available first
	if (typeof control.parent !== 'undefined' && control.parent !== null) {
		console.log(control.parent);
		if (control.value !== control.parent.get(targetField).value) {
			control.setErrors({ notMatching: true })
			return { notMatching: true };
		}
		else {
			return null;
		}
	}
	else {
		return null;
	}
}