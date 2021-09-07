import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NetcastDashboardPage } from './netcast-dashboard.page';

describe('NetcastDashboardPage', () => {
  let component: NetcastDashboardPage;
  let fixture: ComponentFixture<NetcastDashboardPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NetcastDashboardPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NetcastDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
