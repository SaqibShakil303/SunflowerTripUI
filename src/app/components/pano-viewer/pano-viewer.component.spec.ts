import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanoViewerComponent } from './pano-viewer.component';

describe('PanoViewerComponent', () => {
  let component: PanoViewerComponent;
  let fixture: ComponentFixture<PanoViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanoViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanoViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
