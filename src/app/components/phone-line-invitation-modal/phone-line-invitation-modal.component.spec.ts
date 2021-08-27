import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PhoneLineInvitationModalComponent } from './phone-line-invitation-modal.component';

describe('PhoneLineInvitationModalComponent', () => {
  let component: PhoneLineInvitationModalComponent;
  let fixture: ComponentFixture<PhoneLineInvitationModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PhoneLineInvitationModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PhoneLineInvitationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
