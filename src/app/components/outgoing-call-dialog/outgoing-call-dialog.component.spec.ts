import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OutgoingCallDialogComponent } from './outgoing-call-dialog.component';

describe('OutgoingCallDialogComponent', () => {
  let component: OutgoingCallDialogComponent;
  let fixture: ComponentFixture<OutgoingCallDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutgoingCallDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OutgoingCallDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
