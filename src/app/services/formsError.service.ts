import { Injectable } from '@angular/core';
import { FormsErrorMessageType } from "../models/index";

@Injectable({providedIn:'root'})
export class FormsErrorService {
	//errorMessages = {
	//	'email': (paramValue) => 'A valid email is required',
	//	'required': (paramValue) => 'This field is required',
	//	'minlength': (paramValue) => 'The min number of characters is ' + paramValue.requiredLength,
	//	'maxlength': (paramValue) => 'The max allowed number of characters is ' + paramValue.requiredLength,
	//	'pattern': (paramValue) => 'The required pattern is: ' + paramValue.requiredPattern,
	//	'years': (paramValue) => paramValue.message,
	//	'countryCity': (paramValue) => paramValue.message,
	//	'uniqueName': (paramValue) => paramValue.message,
	//	'telephoneNumbers': (paramValue) => paramValue.message,
	//	'telephoneNumber': (paramValue) => paramValue.message
	//};
	errorMessages = {
		'invalidPassword': (paramValue) => 'Invalid password provided',
		'emailTaken': (paramValue) => 'The email is not available',
		'notMatching': (paramValue) => 'The value must match the previous field',
		'invalidOpionalEmail': (paramValue) => 'A valid email is required',
		'email': (paramValue) => 'A valid email is required',
		'required': (paramValue) => 'This field is required',
		'minlength': (paramValue) => 'The min number of characters is ' + paramValue,
		'maxlength': (paramValue) => 'The max allowed number of characters is ' + paramValue,
		'pattern': (paramValue) => 'The required pattern is: ' + paramValue,
		'years': (paramValue) => paramValue,
		'countryCity': (paramValue) => paramValue,
		'uniqueName': (paramValue) => paramValue,
		'telephoneNumbers': (paramValue) => paramValue,
		'telephoneNumber': (paramValue) => paramValue
	};

	getErrorMessage(errorType: string, paramValue: string): string {
		//console.log("errorType: ", errorType);
		//console.log("paramValue: ", paramValue);
		return this.errorMessages[errorType](paramValue);
	}

	getErrorMessages(errors: Array<FormsErrorMessageType>): Array<string> {
		let errorMessages: Array<string> = new Array<string>();
		for (let i = 0; i < errors.length; i++) {
			let message: string = this.getErrorMessage(errors[i].errorTypeName, errors[i].displayValue);
			errorMessages.push(message);
		}

		return errorMessages;
	}

	mapErrors(param: any): string {
		let displayValue = "";
		if (param) {
			//console.log("param:", param);

			let props = new Array('requiredLength', 'requiredPattern', 'message');
			for (let i = 0; i < props.length; i++) {
				if (param.hasOwnProperty(props[i])) {
					displayValue = param[props[i]];
					break;
				}
			}
		}

		return displayValue;
	}
}