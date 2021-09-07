import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PhoneCallActionPopoverComponent } from './phone-call-action-popover.component';

describe('PhoneCallActionPopoverComponent', () => {
  let component: PhoneCallActionPopoverComponent;
  let fixture: ComponentFixture<PhoneCallActionPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PhoneCallActionPopoverComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PhoneCallActionPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
