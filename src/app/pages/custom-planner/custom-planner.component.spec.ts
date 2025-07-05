import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPlannerComponent } from './custom-planner.component';

describe('CustomPlannerComponent', () => {
  let component: CustomPlannerComponent;
  let fixture: ComponentFixture<CustomPlannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomPlannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
