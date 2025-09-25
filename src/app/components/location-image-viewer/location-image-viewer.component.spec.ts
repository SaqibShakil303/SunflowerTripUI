import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationImageViewerComponent } from './location-image-viewer.component';

describe('LocationImageViewerComponent', () => {
  let component: LocationImageViewerComponent;
  let fixture: ComponentFixture<LocationImageViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationImageViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationImageViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
