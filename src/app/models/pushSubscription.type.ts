export class PushSubscriptionType {
	constructor() {
		this.lvcPushNotificationSubscriptionId = 0;
		this.created = null;
		this.email = "";
		this.token = "";
		this.serviceProviderName = "";
		this.applicationName = "";
		this.notes = "";
		this.data = "";
		this.requiresHub = false;
	}
	lvcPushNotificationSubscriptionId: number;
	created: Date;
	email: string;
	token: string;
	serviceProviderName: string;
	applicationName: string;
	notes: string;
	data: string;
	requiresHub: boolean;
}