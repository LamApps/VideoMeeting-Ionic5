export class SdpMessageType {
	constructor() {
		this.sender = "";
		this.sdp = "";
	}
	sender: string; // remoteGuid (other users connectionId)
	sdp: string;
}