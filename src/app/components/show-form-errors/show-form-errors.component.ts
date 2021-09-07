import { Component, OnInit, Input } from '@angular/core';
import { AbstractControlDirective, AbstractControl } from '@angular/forms';
import { Service } from "../../services/index";

@Component({
  selector: 'app-show-form-errors',
  templateUrl: './show-form-errors.component.html',
  styleUrls: ['./show-form-errors.component.scss'],
})
export class ShowFormErrorsComponent implements OnInit {

	constructor(
		private service: Service
	) {
	}

	@Input()
	control: AbstractControlDirective | AbstractControl;

	ngOnInit() {}
	shouldShowErrors(): boolean {
		// this method has binding in dom. so when the control values change, the dom will update
		//console.log("this.control: ", this.control);
		return this.control &&
			this.control.errors &&
			(this.control.dirty || this.control.touched);
	}

	listOfErrors(): string[] {
		return Object.keys(this.control.errors)
			.map(field => this.service.getFormErrorMessage(field, this.service.mapFormDisplayError(this.control.errors[field])));
	}

}
