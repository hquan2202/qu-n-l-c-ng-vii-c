import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPopup } from './view-popup';

describe('ViewPopup', () => {
  let component: ViewPopup;
  let fixture: ComponentFixture<ViewPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
