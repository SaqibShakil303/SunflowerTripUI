import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDashboardNewComponent } from './customer-dashboard-new.component';

describe('CustomerDashboardNewComponent', () => {
  let component: CustomerDashboardNewComponent;
  let fixture: ComponentFixture<CustomerDashboardNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDashboardNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerDashboardNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
