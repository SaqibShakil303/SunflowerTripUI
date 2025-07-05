import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourFilterComponent } from './tour-filter.component';

describe('TourFilterComponent', () => {
  let component: TourFilterComponent;
  let fixture: ComponentFixture<TourFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
