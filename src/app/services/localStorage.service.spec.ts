/////<reference path="../../node_modules/@types/jasmine/index.d.ts" />
import { TestBed, inject } from '@angular/core/testing';
import { LocalStorageService } from './localStorage.service';
import { JsHelperService } from './jsHelper.service';
declare var cordova: any;

describe('localStorage.service', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				LocalStorageService, JsHelperService
			]
		});
	});

	//NOTE: currently unable to unit test. we need to mock the NativeStorage to beable to unit test.

	//xit('Should store the oject and retrieve the same object',
	//	inject([JsHelperService], async (jsHelperService: JsHelperService) => {
	//		// arrange
	//		let timestamp = Date.now.toString();
	//		let content: object = { timestamp: timestamp };
	//		let fileName: string = "testFile.txt";

	//		await NativeStorage.setItem(fileName, content);

	//		let result = await NativeStorage.getItem(fileName);

	//		//assert
	//		expect(result.timestamp === timestamp).toBeTruthy();
	//	})
	//);

	//xit('Should store the oject',
	//	inject([LocalStorageService, JsHelperService], async (localStorageService: LocalStorageService) => {
	//		// arrange
	//		let timestamp = Date.now.toString();
	//		let content: object = { timestamp: timestamp };
	//		let fileName: string = "testFile.txt";
	//		let result: boolean = false;
	//		//act
	//		try {
	//			await localStorageService.setItem(fileName, content);
	//			result = true;
	//		}
	//		catch (error) {
	//			console.log("Should store the object failed: ", error);
	//		}
	//		//var text = await localStorageService.getItem(fileName);
	//		//assert
	//		expect(result).toBeTruthy();
	//	})
	//);

	//// readFile
	//xit('Should read the contents of an existing file',
	//	inject([LocalStorageService, JsHelperService], async (localStorageService: LocalStorageService) => {
	//		// arrange
	//		let content: string = "some test content";
	//		let fileName: string = "testFile.txt";
	//		//await localStorageService.writeFile(fileName, content);
	//		//act

	//		let text = await localStorageService.readFile(fileName);

	//		console.log("readFile content: ", content);
	//		//assert
	//		expect(text === content).toBeTruthy();
	//	})
	//);
});