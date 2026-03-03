import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerOnboardViaBookingComponent } from './customer-onboard-via-booking.component';

describe('CustomerOnboardViaBookingComponent', () => {
  let component: CustomerOnboardViaBookingComponent;
  let fixture: ComponentFixture<CustomerOnboardViaBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerOnboardViaBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerOnboardViaBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
