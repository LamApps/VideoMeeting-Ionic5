export class ListItemType {
	constructor() {
		this.id = null;
		this.imgSrc = "";
		this.title = "";
		this.subTitle = "";
		this.content = "";
		this.links = null;
	}

	id: number;
	imgSrc: string;
	title: string;
	subTitle: string;
	content: string;
	links: Array<string>;
}