import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripLeadsComponent } from './trip-leads.component';

describe('TripLeadsComponent', () => {
  let component: TripLeadsComponent;
  let fixture: ComponentFixture<TripLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripLeadsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
