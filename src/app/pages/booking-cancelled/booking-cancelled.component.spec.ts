import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingCancelledComponent } from './booking-cancelled.component';

describe('BookingCancelledComponent', () => {
  let component: BookingCancelledComponent;
  let fixture: ComponentFixture<BookingCancelledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingCancelledComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingCancelledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
