import { Injectable } from '@angular/core';
import {
	JsHelperService,
	ConfigService,
	LocalStorageService,
	//Service,
} from './index';
import {
	CompanyProfileDto,
	//WebApiResponseType,
	//WebApiResponseStatusType,
	IdDto, SearchTermDto,
	LocationSearchDto,
	CompanyEmployeeDto,
	LongIdDto,
	//EmailDto,
	//CompanyEmployeeInviteDto,
	CompanyLocationDto,
	CompanyVideoDto,
	CompanyPhotoDto,
	PbxLineDto,
	PbxLineRepDto,
	PbxLineRepStatusDto,
	PbxCallQueueDto,
	PagingOrderByDto,
	CountryDto,
	//PropertyTrackingEnum,
	MemberType,
	ContactUsDto,
	SendCopyOfMessageDto,
} from '../models/index';
//import { error } from 'util';
//import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { ValueTransformer } from '@angular/compiler/src/util';

@Injectable({providedIn:'root'})
export class PbxService {
	httpPost: string = "POST";
	httpGet: string = "GET";
	httpDelete: string = "DELETE";

	constructor(
		private jsHelperService: JsHelperService,
		private storageService: LocalStorageService,
		private configService: ConfigService,
	) {
	}

	async getPbxLines(): Promise<Array<PbxLineDto>> {
		return this.storageService.getItem(this.configService.keyPbxlines);
	}
	async setPbxLines(value: Array<PbxLineDto>): Promise<boolean> {
		return this.storageService.setItem(this.configService.keyPbxlines, value);
	}

	async getCompanyProfile(): Promise<CompanyProfileDto> {
		return this.storageService.getItem(this.configService.keyCompanyProfile);
	}
	async setCompanyProfile(value: CompanyProfileDto): Promise<boolean> {
		return this.storageService.setItem(this.configService.keyCompanyProfile, value);
	}

	async getCountries(): Promise<Array<CountryDto>> {
		return this.storageService.getItem(this.configService.keyCountries);
	}
	async setCountries(value: Array<CountryDto>): Promise<boolean> {
		return this.storageService.setItem(this.configService.keyCountries, value);
	}

	appendUrl(url, ...params) {
		return this.configService.pbxController + url;
	}

	getMemberById(memberId: number, accessToken: string): Promise<MemberType> {
		return new Promise<MemberType>((resolve, reject) => {
			let url = this.configService.webApiBase + "Member/GetMemberById/" + memberId.toString() + "/";
			let payload = null;

			this.jsHelperService.ajaxRequestParsed<MemberType>(this.httpGet, url, payload, accessToken)
				.then((dto: MemberType) => {
					resolve(dto);
				})
				.catch((error) => {
					reject(error);
				});
		})
	}

	// Stores: this.countries
	async getCountryIsoCodes(accessToken: string): Promise<Array<CountryDto>> {
		try {
			let url = this.appendUrl('GetCountryIsoCodes')
			let payload = null;
			let dto: Array<CountryDto> = await this.jsHelperService.ajaxRequestParsed<Array<CountryDto>>(this.httpGet, url, payload, accessToken)
			await this.setCountries(dto);
			return dto;
		}
		catch (e) {
			throw (e);
		}
	}

	// #region companyProfile

	async getMembersCompanyProfile(memberId: number, accessToken: string): Promise<CompanyProfileDto> {
		try {
			let url = this.configService.pbxController + "GetMembersCompany/" + memberId.toString() + "/";
			let payload = null;

			let dto: CompanyProfileDto = await this.jsHelperService.ajaxRequestParsed<CompanyProfileDto>(this.httpGet, url, payload, accessToken);
			return dto;
		}
		catch (e) {
			throw (e);
		}
	}

	getCompanyProfileById(id: number, accessToken: string): Promise<CompanyProfileDto> {
		return new Promise<CompanyProfileDto>((resolve, reject) => {
			let url = this.appendUrl(`GetCompanyProfileById/${id}`)
			let payload = null

			this.jsHelperService.ajaxRequestParsed<CompanyProfileDto>(this.httpGet, url, payload, accessToken)
				.then((dto: CompanyProfileDto) => {
					this.setCompanyProfile(dto)
						.then(() => {
							resolve(dto);
						});
				})
				.catch((error) => { reject(error); });
		})
	}

	getCompanyProfilesByMemberId(id: IdDto, accessToken: string): Promise<Array<CompanyProfileDto>> {
		return new Promise<Array<CompanyProfileDto>>((resolve, reject) => {
			let url = this.appendUrl('GetCompanyProfilesByMemberId')
			let payload = this.jsHelperService.formatWebApiPayload(id);

			this.jsHelperService.ajaxRequestParsed<Array<CompanyProfileDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<CompanyProfileDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	async searchCompanyProfilesByName(term: SearchTermDto, accessToken: string): Promise<Array<CompanyProfileDto>> {
		return new Promise<Array<CompanyProfileDto>>((resolve, reject) => {
			let url = this.appendUrl('SearchCompanyProfilesByName')

			let payload = this.jsHelperService.formatWebApiPayload(term);

			this.jsHelperService.ajaxRequestParsed<Array<CompanyProfileDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<CompanyProfileDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	searchCompanyProfilesByLocation(location: LocationSearchDto, accessToken: string): Promise<Array<CompanyProfileDto>> {
		return new Promise<Array<CompanyProfileDto>>((resolve, reject) => {
			let url = this.appendUrl('SearchCompanyProfilesByLocation')
			let payload = this.jsHelperService.formatWebApiPayload(location);

			this.jsHelperService.ajaxRequestParsed<Array<CompanyProfileDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<CompanyProfileDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	// #endregion

	// #region companyEmployee

	async getCompanyEmployeeById(id: number, accessToken: string): Promise<CompanyEmployeeDto> {
		try {
			let url = this.appendUrl(`GetCompanyEmployeeById/${id}`)

			let payload = null
			let dto: CompanyEmployeeDto = await this.jsHelperService.ajaxRequestParsed<CompanyEmployeeDto>(this.httpGet, url, payload, accessToken)
			return dto;
		}
		catch (e) {
			throw (e);
		}
	}

	getCompanyEmployeesByCompanyProfileId(idDto: IdDto, accessToken: string): Promise<Array<CompanyEmployeeDto>> {
		return new Promise<Array<CompanyEmployeeDto>>((resolve, reject) => {
			let url = this.appendUrl('GetCompanyEmployeesByCompanyProfileId')
			let payload = this.jsHelperService.formatWebApiPayload(idDto);

			this.jsHelperService.ajaxRequestParsed<Array<CompanyEmployeeDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<CompanyEmployeeDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	getCompanyEmployeeByMemberId(companyProfileId: number, memberId: number, accessToken: string): Promise<CompanyEmployeeDto> {
		return new Promise<CompanyEmployeeDto>((resolve, reject) => {
			let url = this.appendUrl(`GetCompanyEmployeeByMemberId/${companyProfileId}/${memberId}`)

			let payload = null

			this.jsHelperService.ajaxRequestParsed<CompanyEmployeeDto>(this.httpGet, url, payload, accessToken)
				.then((dto: CompanyEmployeeDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	getCompanyEmployeeByEmail(email: string, companyProfileId: number, accessToken: string): Promise<CompanyEmployeeDto> {
		return new Promise<CompanyEmployeeDto>((resolve, reject) => {
			let url = this.appendUrl(`GetCompanyEmployeeByEmail/${companyProfileId}/${email}/`)

			let payload = null;

			this.jsHelperService.ajaxRequestParsed<CompanyEmployeeDto>(this.httpGet, url, payload, accessToken)
				.then((dto: CompanyEmployeeDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	searchCompanyEmployeesByEmail(emailSearch: SearchTermDto, companyProfileId: number, accessToken: string): Promise<Array<CompanyEmployeeDto>> {
		return new Promise<Array<CompanyEmployeeDto>>((resolve, reject) => {
			let url = this.appendUrl(`SearchCompanyEmployeesByEmail/${companyProfileId}`)
			let payload = this.jsHelperService.formatWebApiPayload(emailSearch);
			this.jsHelperService.ajaxRequestParsed<Array<CompanyEmployeeDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<CompanyEmployeeDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	searchCompanyEmployeeByFirstName(term: SearchTermDto, companyProfileId: number, accessToken: string): Promise<CompanyEmployeeDto> {
		return new Promise<CompanyEmployeeDto>((resolve, reject) => {
			let url = this.appendUrl(`SearchCompanyEmployeeByFirstName/${companyProfileId}`)
			let payload = this.jsHelperService.formatWebApiPayload(term);
			this.jsHelperService.ajaxRequestParsed<CompanyEmployeeDto>(this.httpPost, url, payload, accessToken)
				.then((dto: CompanyEmployeeDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	searchCompanyEmployeeByLastName(term: SearchTermDto, companyProfileId: number, accessToken: string): Promise<CompanyEmployeeDto> {
		return new Promise<CompanyEmployeeDto>((resolve, reject) => {
			let url = this.appendUrl(`SearchCompanyEmployeeByLastName/${companyProfileId}`)

			let payload = this.jsHelperService.formatWebApiPayload(term);

			this.jsHelperService.ajaxRequestParsed<CompanyEmployeeDto>(this.httpPost, url, payload, accessToken)
				.then((dto: CompanyEmployeeDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	// #endregion

	// #region CompanyLocation
	getCompanyLocationById(companyLocationId: number, accessToken: string): Promise<CompanyLocationDto> {
		return new Promise<CompanyLocationDto>((resolve, reject) => {
			let payload = null
			let url = this.appendUrl(`GetCompanyLocationById/${companyLocationId}`)
			this.jsHelperService.ajaxRequestParsed<CompanyLocationDto>(this.httpGet, url, payload, accessToken)
				.then((dto: CompanyLocationDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	getCompanyLocationsByCompanyProfileId(idDto: IdDto, accessToken: string): Promise<Array<CompanyLocationDto>> {
		return new Promise<Array<CompanyLocationDto>>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(idDto);

			let url = this.appendUrl(`GetCompanyLocationsByCompanyProfileId`)
			this.jsHelperService.ajaxRequestParsed<Array<CompanyLocationDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<CompanyLocationDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	searchCompanyLocationsByLocation(locationSearch: LocationSearchDto, companyProfileId: number, accessToken: string): Promise<Array<CompanyLocationDto>> {
		//let funcName = 'searchCompanyLocationsByLocation'
		return new Promise<Array<CompanyLocationDto>>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(locationSearch);

			let url = this.appendUrl(`SearchCompanyLocationsByLocation/${companyProfileId}`)
			this.jsHelperService.ajaxRequestParsed<Array<CompanyLocationDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<CompanyLocationDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	// #endregion

	// #region CompanyVideos

	getCompanyVideoById(companyVideoId: number, accessToken: string): Promise<CompanyVideoDto> {
		return new Promise<CompanyVideoDto>((resolve, reject) => {
			let payload = null;

			let url = this.appendUrl(`GetCompanyVideoById/${companyVideoId}/`)
			this.jsHelperService.ajaxRequestParsed<CompanyVideoDto>(this.httpGet, url, payload, accessToken)
				.then((dto: CompanyVideoDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	getCompanyVideosByCompanyProfileId(idDto: IdDto, accessToken: string): Promise<Array<CompanyVideoDto>> {
		return new Promise<Array<CompanyVideoDto>>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(idDto);

			let url = this.appendUrl(`getCompanyVideosByCompanyProfileId`)
			this.jsHelperService.ajaxRequestParsed<Array<CompanyVideoDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<CompanyVideoDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	// #endregion

	// #region CompanyPhotos

	getCompanyPhotoById(companyPhotoId: number, accessToken: string): Promise<CompanyPhotoDto> {
		return new Promise<CompanyPhotoDto>((resolve, reject) => {
			let payload = null;
			let url = this.appendUrl(`GetCompanyPhotoById/${companyPhotoId}/`)
			this.jsHelperService.ajaxRequestParsed<CompanyPhotoDto>(this.httpGet, url, payload, accessToken)
				.then((dto: CompanyPhotoDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	getCompanyPhotosByCompanyProfileId(idDto: IdDto, accessToken: string): Promise<Array<CompanyPhotoDto>> {
		return new Promise<Array<CompanyPhotoDto>>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(idDto);
			let url = this.appendUrl(`getCompanyPhotosByCompanyProfileId/`)
			this.jsHelperService.ajaxRequestParsed<Array<CompanyPhotoDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<CompanyPhotoDto>) => {
					resolve(dto);
				})
				.catch((error) => {
					reject(error);
				})
		})
	}

	// #endregion

	// #region pbxLine

	getPbxLineById(id: number, accessToken: string): Promise<PbxLineDto> {
		return new Promise<PbxLineDto>((resolve, reject) => {
			let payload = null;
			let url = this.appendUrl(`GetPbxLineById/${id}`)
			this.jsHelperService.ajaxRequestParsed<PbxLineDto>(this.httpGet, url, payload, accessToken)
				.then((dto: PbxLineDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	getPbxLinesByCompanyProfileId(dto: IdDto, accessToken: string): Promise<Array<PbxLineDto>> {
		return new Promise<Array<PbxLineDto>>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(dto);

			let url = this.appendUrl(`GetPbxLinesByCompanyProfileId/`)
			this.jsHelperService.ajaxRequestParsed<Array<PbxLineDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<PbxLineDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); })
		})
	}

	getMemberPbxLines(dto: PagingOrderByDto, accessToken: string): Promise<Array<PbxLineDto>> {
		return new Promise<Array<PbxLineDto>>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(dto);

			let url = this.appendUrl(`GetMemberPbxLines/`)
			this.jsHelperService.ajaxRequestParsed<Array<PbxLineDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<PbxLineDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	getEmployeePbxLines(dto: IdDto, memberId: number, accessToken: string): Promise<Array<PbxLineDto>> {
		return new Promise<Array<PbxLineDto>>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(dto);

			let url = this.appendUrl(`GetEmployeePbxLines/${memberId.toString()}/`)
			this.jsHelperService.ajaxRequestParsed<Array<PbxLineDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<PbxLineDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	searchPbxLinesByLineName(lineNameSearch: SearchTermDto, companyProfileId: number, accessToken: string): Promise<Array<PbxLineDto>> {
		return new Promise<Array<PbxLineDto>>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(lineNameSearch);
			let url = this.appendUrl(`SearchPbxLinesByLineName/${companyProfileId}/`)
			this.jsHelperService.ajaxRequestParsed<Array<PbxLineDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<PbxLineDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	// #endregion

	// #region PbxLineReps

	getPbxLineRepById(id: number, accessToken: string): Promise<PbxLineRepDto> {
		return new Promise<PbxLineRepDto>((resolve, reject) => {
			let payload = null
			let url = this.appendUrl(`GetPbxLineRepById/${id}/`)
			this.jsHelperService.ajaxRequestParsed<PbxLineRepDto>(this.httpGet, url, payload, accessToken)
				.then((dto: PbxLineRepDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	getPbxLineRepByEmployeeId(companyEmployeeId: number, pbxLineId: number, accessToken: string): Promise<PbxLineRepDto> {
		return new Promise<PbxLineRepDto>((resolve, reject) => {
			let payload = null
			let url = this.appendUrl(`GetPbxLineRepByEmployeeId/${companyEmployeeId}/${pbxLineId}/`)
			this.jsHelperService.ajaxRequestParsed<PbxLineRepDto>(this.httpGet, url, payload, accessToken)
				.then((dto: PbxLineRepDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	getPbxLineRepsByCompanyProfileId(companyProfileId: IdDto, accessToken: string): Promise<Array<PbxLineRepDto>> {
		return new Promise<Array<PbxLineRepDto>>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(companyProfileId);
			let url = this.appendUrl(`GetPbxLineRepsByCompanyProfileId/`)
			this.jsHelperService.ajaxRequestParsed<Array<PbxLineRepDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<PbxLineRepDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	getPbxLineRepsByPbxLineId(dto: LongIdDto, accessToken: string): Promise<Array<PbxLineRepDto>> {
		return new Promise<Array<PbxLineRepDto>>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(dto);

			let url = this.appendUrl(`GetPbxLineRepsByPbxLineId/`)
			this.jsHelperService.ajaxRequestParsed<Array<PbxLineRepDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<PbxLineRepDto>) => {
					resolve(dto);
				})
				.catch((error) => {
					reject(error);
				})
		})
	}

	searchPbxLineRepsByEmployeeFirstName(term: SearchTermDto, accessToken: string): Promise<Array<PbxLineRepDto>> {
		return new Promise<Array<PbxLineRepDto>>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(term);
			let url = this.appendUrl(`SearchPbxLineRepsByEmployeeFirstName/`)
			this.jsHelperService.ajaxRequestParsed<Array<PbxLineRepDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<PbxLineRepDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	// #endregion

	// #region pbxLineRepStatus

	getPbxLineRepStatusById(pbxLineRepStatusId: number, accessToken: string): Promise<PbxLineRepStatusDto> {
		return new Promise<PbxLineRepStatusDto>((resolve, reject) => {
			let payload = null
			let url = this.appendUrl(`GetPbxLineRepStatusById/${pbxLineRepStatusId}/`)
			this.jsHelperService.ajaxRequestParsed<PbxLineRepStatusDto>(this.httpGet, url, payload, accessToken)
				.then((dto: PbxLineRepStatusDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	getPbxLineRepStatusByPbxLineRepId(pbxLineRepId: LongIdDto, accessToken: string): Promise<Array<PbxLineRepStatusDto>> {
		return new Promise<Array<PbxLineRepStatusDto>>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(pbxLineRepId);
			let url = this.appendUrl(`GetPbxLineRepStatusByPbxLineRepId/`)
			this.jsHelperService.ajaxRequestParsed<Array<PbxLineRepStatusDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<PbxLineRepStatusDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	getPbxLineRepStatusByConnectionGuid(guid: string, accessToken: string): Promise<PbxLineRepStatusDto> {
		return new Promise<PbxLineRepStatusDto>((resolve, reject) => {
			let payload = null;
			let url = this.appendUrl(`GetPbxLineRepStatusByConnectionGuid/${guid}/`)
			this.jsHelperService.ajaxRequestParsed<PbxLineRepStatusDto>(this.httpGet, url, payload, accessToken)
				.then((dto: PbxLineRepStatusDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	isRepOnline(pbxLineRepId: number, accessToken: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			let payload = null
			let url = this.appendUrl(`IsRepOnline/${pbxLineRepId}/`)
			this.jsHelperService.ajaxRequestParsed<boolean>(this.httpGet, url, payload, accessToken)
				.then((response: boolean) => {
					resolve(response);
				})
				.catch((error) => { reject(error); });
		})
	}

	// #endregion

	// #region PbxCallQueue
	createPbxCallQueue(pbxCallQueue: PbxCallQueueDto, accessToken: string): Promise<PbxCallQueueDto> {
		return new Promise<PbxCallQueueDto>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(pbxCallQueue);
			let url = this.appendUrl(`CreatePbxCallQueue/`)
			this.jsHelperService.ajaxRequestParsed<PbxCallQueueDto>(this.httpPost, url, payload, accessToken)
				.then((dto: PbxCallQueueDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	updatePbxCallQueue(pbxCallQueue: PbxCallQueueDto, accessToken: string) {
		return new Promise<PbxCallQueueDto>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(pbxCallQueue);
			let url = this.appendUrl(`UpdatePbxCallQueue/`)
			this.jsHelperService.ajaxRequestParsed<PbxCallQueueDto>(this.httpPost, url, payload, accessToken)
				.then((dto: PbxCallQueueDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	deletePbxCallQueue(pbxCallQueue: PbxCallQueueDto, accessToken: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			let payload = null
			let url = this.appendUrl(`DeletePbxCallQueue/${pbxCallQueue.pbxCallQueueId}/`)
			this.jsHelperService.ajaxRequestParsed<string>(this.httpDelete, url, payload, accessToken)
				.then((message: string) => {
					resolve(message);
				})
				.catch((error) => { reject(error); });
		})
	}

	getPbxCallQueueById(pbxCallQueueId: number, accessToken: string): Promise<PbxCallQueueDto> {
		return new Promise<PbxCallQueueDto>((resolve, reject) => {
			let payload = null
			let url = this.appendUrl(`GetPbxCallQueueById/${pbxCallQueueId}/`)
			this.jsHelperService.ajaxRequestParsed<PbxCallQueueDto>(this.httpGet, url, payload, accessToken)
				.then((dto: PbxCallQueueDto) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	getPbxCallQueuesByPbxLineRepId(pbxlineRepId: IdDto, accessToken: string): Promise<Array<PbxCallQueueDto>> {
		return new Promise<Array<PbxCallQueueDto>>((resolve, reject) => {
			let payload = this.jsHelperService.formatWebApiPayload(pbxlineRepId);
			let url = this.appendUrl(`GetPbxCallQueuesByPbxLineRepId/`)
			this.jsHelperService.ajaxRequestParsed<Array<PbxCallQueueDto>>(this.httpPost, url, payload, accessToken)
				.then((dto: Array<PbxCallQueueDto>) => {
					resolve(dto);
				})
				.catch((error) => { reject(error); });
		})
	}

	// #endregion

	// #region ContactUs
	async createContactUs(model: ContactUsDto): Promise<ContactUsDto> {
		try {
			let payload = this.jsHelperService.formatWebApiPayload(model);
			let url = this.configService.webApiBase + "api/CreateContactUs";
			//let url = `http://localhost:18303/api/CreateContactUs`;
			let dto = await this.jsHelperService.ajaxRequestParsed<ContactUsDto>(this.httpPost, url, payload, null);
			return dto;
		}
		catch (e) {
			console.log("createContactUs error: ", e);
			throw (e);
		}
	}

	async getContactUsById(contactUsId: number): Promise<ContactUsDto> {
		try {
			let payload = null;
			let url = this.configService.webApiBase + `api/GetContactUsById/${contactUsId}/`;
			let dto = await this.jsHelperService.ajaxRequestParsed<ContactUsDto>(this.httpGet, url, payload, null);
			return dto;
		}
		catch (e) {
			throw (e);
		}
	}
	// #endregion

	// #region Utilities
	async getHubConnectionEmailByGuid(guid: string, accessToken: string): Promise<string> {
		try {
			let payload = null
			let url = this.appendUrl(`GetHubConnectionEmailByGuid/${guid}`)
			let email: string = await this.jsHelperService.ajaxRequestParsed<string>(this.httpGet, url, payload, accessToken)
			return email;
		}
		catch (e) {
			throw (e);
		}
	}

	async sendCopyOfMessage(dto: SendCopyOfMessageDto, accessToken: string): Promise<void> {
		try {
			let payload = this.jsHelperService.formatWebApiPayload(dto);
			let url = this.configService.pbxController + 'SendCopyOfMessage/';
			//let result: SendCopyOfMessageDto = await this.jsHelperService.ajaxRequestParsed<SendCopyOfMessageDto>(this.httpPost, url, payload, accessToken)
			await this.jsHelperService.ajaxRequestParsed<SendCopyOfMessageDto>(this.httpPost, url, payload, accessToken)
			return;
		}
		catch (e) {
			throw (e);
		}
	}

	// #endregion
}