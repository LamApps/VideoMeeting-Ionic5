import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MeetingAttendeeComponent } from './meeting-attendee.component';

describe('MeetingAttendeeComponent', () => {
  let component: MeetingAttendeeComponent;
  let fixture: ComponentFixture<MeetingAttendeeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingAttendeeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MeetingAttendeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
