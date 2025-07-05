import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationMainComponent } from './destination-main.component';

describe('DestinationMainComponent', () => {
  let component: DestinationMainComponent;
  let fixture: ComponentFixture<DestinationMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
