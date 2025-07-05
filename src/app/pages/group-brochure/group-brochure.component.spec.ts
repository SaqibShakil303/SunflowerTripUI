import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupBrochureComponent } from './group-brochure.component';

describe('GroupBrochureComponent', () => {
  let component: GroupBrochureComponent;
  let fixture: ComponentFixture<GroupBrochureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupBrochureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupBrochureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
