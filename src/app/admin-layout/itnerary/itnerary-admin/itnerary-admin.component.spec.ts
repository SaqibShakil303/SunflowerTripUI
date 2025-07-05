import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItneraryAdminComponent } from './itnerary-admin.component';

describe('ItneraryAdminComponent', () => {
  let component: ItneraryAdminComponent;
  let fixture: ComponentFixture<ItneraryAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItneraryAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItneraryAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
