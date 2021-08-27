import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
	TextMessageType,
} from "../../models/index";

@Component({
  selector: 'app-text-messaging-message',
  templateUrl: './text-messaging-message.component.html',
  styleUrls: ['./text-messaging-message.component.scss'],
})
export class TextMessagingMessageComponent implements OnInit {

	constructor() { }
	@Input('message') message: TextMessageType;
	@Output() onOpenPrivateSmsInterface: EventEmitter<string> = new EventEmitter<string>();

	ngOnInit() {}
	
	openPrivateSmsInterface(): void {
		//console.log("openPrivateSmsInterface message:", this.message);
		this.onOpenPrivateSmsInterface.emit(this.message.id);
	}

	async sendPrivate(): Promise<void> {
	}
}
