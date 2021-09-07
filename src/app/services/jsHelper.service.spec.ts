///<reference path="../../node_modules/@types/jasmine/index.d.ts" />
import { TestBed, inject } from '@angular/core/testing';
import { JsHelperService } from './index';
import { SignalrHttpResponseType, WebApiResponseType, HttpStatusCodeEnum, WebApiResponseStatusType } from '../models/index';
describe('jsHelper.service.ajaxRequest', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				JsHelperService
			]
		});
	});

	// ajaxRequest
	it('Should get back the payload as a json string',
		inject([JsHelperService], async (jsHelperService: JsHelperService) => {
			// arrange
			let payload = { Id: "12345", Name: "John", Email: "jon@livenetvideo.com" };

			//act
			var result = await jsHelperService.ajaxRequest("POST", "https://nofb.org/LNVApi/Testing/TestPostRequestNoToken", payload, null);

			//console.log("ajaxRequest result: ", result);
			//assert
			expect(result).toBeDefined();
		})
	);
});

describe('JsHelperService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				JsHelperService
			]
		});
	});

	// objectPropertiesToPascal
	it('Should turn object property names to pascal case',
		inject([JsHelperService], (jsHelperService) => {
			// arrange
			let obj = {
				firstName: "John", lastName: "MrLe", age: 30, car: null,
				CarTypes: {
					firstCar: "audi", secondCar: "honda", thirdCar: "ford",
					fourthCar: { name: "Toyota", Model: "camery" }
				}
			};

			//act
			let myObject: any = jsHelperService.objectPropertiesToPascal(obj);
			console.log("objectPropertyToPascal: ", myObject);
			//assert
			expect(myObject).toBeDefined();
			expect(myObject.FirstName === "John").toBeTruthy();
		})
	);

	// objectPropertiesToCamel
	it('Should turn object property names to camel case',
		inject([JsHelperService], (jsHelperService) => {
			// arrange
			let obj = {
				FirstName: "John", LastName: "MrLe", Age: 30, Car: null,
				CarTypes: {
					FirstCar: "audi", SecondCar: "honda", ThirdCar: "ford",
					fourthCar: { Name: "Toyota", Model: "camery" }
				}
			};

			//act
			let myObject: any = jsHelperService.objectPropertiesToCamel(obj);
			console.log("objectPropertyToCamel: ", myObject);
			//assert
			expect(myObject).toBeDefined();
			expect(myObject.firstName === "John").toBeTruthy();
		})
	);

	// tryParseJson
	it('Should create an object from the json string with name = John',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange
			let json = '{ "name":"John", "age":30, "car":null }';

			//act
			let myObject: any = jsHelperService.tryParseJson(json);

			//console.log("myObject: ", myObject);
			//assert
			expect(myObject).toBeDefined();
			expect(typeof myObject.name !== "undefined").toBeTruthy();
			expect(myObject.name === "John").toBeTruthy();
			//expect(connectionId !== "").toBeTruthy();
		})
	);

	// isEmpty(null)
	it('Should return true when isEmpty param is null',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange
			let nullValue = null;

			//act
			let isNullValue = jsHelperService.isEmpty(nullValue);

			//assert
			expect(isNullValue).toBeTruthy();
		})
	);

	// isEmpty(object)
	it('Should return true when isEmpty param is {} empty object',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange
			let emptyObject = {};

			//act
			let isEmptyObject = jsHelperService.isEmpty(emptyObject);

			//assert
			expect(isEmptyObject).toBeTruthy();
		})
	);

	it('Should return true when isEmpty param is [] empty array',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange
			let emptyArray = new Array();

			//act
			let isEmptyArray = jsHelperService.isEmpty(emptyArray);

			//assert
			expect(isEmptyArray).toBeTruthy();
		})
	);

	// isEmpty("")
	it('Should return true when isEmpty param is empty string ""',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange
			let emptyString = "";

			//act
			let isEmptyString = jsHelperService.isEmpty(emptyString);

			//assert
			expect(isEmptyString).toBeTruthy();
		})
	);

	// isEmpty(undefined)
	it('Should return true when isEmpty param is undefined',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange
			let undefinedValue = undefined;

			//act
			let isUndefinedValue = jsHelperService.isEmpty(undefinedValue);

			//assert
			expect(isUndefinedValue).toBeTruthy();
		})
	);

	// base64Encode(string)
	it('Should return base64encoded string',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange
			let ip = "108.47.122.178";

			//act
			let base64encoded = jsHelperService.base64Encode(ip);
			//console.log("base64encoded: ", base64encoded);
			//assert
			expect(base64encoded === 'MTA4LjQ3LjEyMi4xNzg=').toBeTruthy();
		})
	);

	// base64Decode(string)
	it('Should return base64decoded string',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange
			let base64encoded = 'MTA4LjQ3LjEyMi4xNzg=';

			//act
			let ip = jsHelperService.base64Decode(base64encoded);
			//console.log("base64encoded: ", base64encoded);
			//assert
			expect(ip === '108.47.122.178').toBeTruthy();
		})
	);

	// createHash(ip)
	it('Should return hash when given ip',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange
			let ip = "108.47.122.178";

			//act
			let hash = jsHelperService.createHash(ip);
			//console.log("hash: ", hash);
			//assert
			expect(hash !== "").toBeTruthy();
		})
	);

	// stringify(object)
	it('Should turn object into json string',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange
			let httpResponseMessage = { statusCode: 200, content: "some content", actionCode: "1" };

			//act
			let json = jsHelperService.stringify(httpResponseMessage);
			//console.log("stringify json: ", json);
			//assert
			expect(json !== "").toBeTruthy();
		})
	);

	// parseHttpResponseMessage(httpResonseJson)
	it('Should parse signalR response to SignalrHttpResponseType',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange
			let response = '{"statusCode":200, "content": "some content", "actionCode": "3"}';

			//act
			let signalrResponse = jsHelperService.parseSignalrResponse(response);
			//console.log("httpResponse: ", signalrResponse);
			//assert
			expect(signalrResponse.statusCode === HttpStatusCodeEnum.ok).toBeTruthy();
		})
	);

	// jsonToObject<T>(json)
	it('Should parse json into object of type WebApiResponseType',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange
			let response = '{"Status":"SUCCESS", "Data": "test data", "TypeName": "String"}';

			//act
			let result: WebApiResponseType = jsHelperService.jsonToObject<WebApiResponseType>(response, true);

			//assert
			expect(result.status === WebApiResponseStatusType.success).toBeTruthy();
		})
	);

	// parseWebApiResponse<T>(json)
	it('Should parse webApi response to WebApiResponseType',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange
			let data = {
				Status: "FAIL",
				Data: "subdata",
				TypeName: "String"
			};
			let testObj = {
				Status: "SUCCESS",
				Data: jsHelperService.stringify(data),
				TypeName: "string"
			}

			let response = jsHelperService.stringify(testObj);

			//act
			let result: WebApiResponseType = jsHelperService.parseWebApiResponse<WebApiResponseType>(response);

			//assert
			expect(result.status === WebApiResponseStatusType.fail).toBeTruthy();
		})
	);

	// parseWebApiResponse<T>(json)
	it('Should rename json properties using reviver',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange
			let person = {
				FirstName: "Timmy",
				LastName: "Allen",
				Hobby: "Football"
			};
			let testObj = {
				Status: "SUCCESS",
				DataDto: person,
				TypeName: "string"
			}

			let response = jsHelperService.stringify(testObj);

			let reviver = function (key, value) {
				if (key === "FirstName") {
					let pascalKey = key.charAt(0).toLowerCase() + key.slice(1);
					this[pascalKey] = value;
					delete this.key;
					return;
				}
				else if (key === "DataDto") {
					let newKey = "data";
					this[newKey] = value;
					delete this.key;
					return;
				}
				else {
					return value;
				}
			}

			//act
			let result: any = jsHelperService.tryParseJson(response, reviver);

			//console.log("reviver test result: ", result);

			//assert
			expect(result.dataDto !== "").toBeTruthy();
		})
	);

	// jsonToObject<Array<T>>(jsong)
	it('Should parse json array into object of type Array<WebApiResponseType>',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange

			let data1 = {
				Status: "SUCCESS", Sata: "test data1", TypeName: "string"
			}

			let data2 = {
				status: "FAIL", Data: "test data2", typeName: "string"
			}

			let data3 = {
				status: "SUCCESS", Data: "test data3", typeName: "string"
			}
			let arr = new Array();
			arr.push(data1);
			arr.push(data2);
			arr.push(data3);

			let response = jsHelperService.stringify(arr);

			//act
			let result: Array<WebApiResponseType> = jsHelperService.jsonToObject<Array<WebApiResponseType>>(response, true);
			//console.log("got result: ", result);
			//assert
			expect(result[0].status === WebApiResponseStatusType.success).toBeTruthy();
		})
	);

	// return proper array index
	it('Should return proper array index',
		inject([JsHelperService], (jsHelperService: JsHelperService) => {
			// arrange

			let blockedList = [{ id: "1", email: "mock1@lvc.com" }, { id: "2", email: "mock2@lvc.com" },
			{ id: "3", email: "mock3@lvc.com" }, { id: "4", email: "mock4@lvc.com" },
			{ id: "5", email: "mock2@lav.com" }, { id: "6", email: "mock5@lvc.com" }];

			let email = "mock4@lvc.com";
			let id = 1;
			//act
			let result: boolean | number = blockedList.findIndex((value: any) => {
				return value.id == id;
			});

			//assert
			expect(result === 0).toBeTruthy();
		})
	);
});