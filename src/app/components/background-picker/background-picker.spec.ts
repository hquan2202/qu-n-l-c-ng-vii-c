import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundPicker } from './background-picker';

describe('BackgroundPicker', () => {
  let component: BackgroundPicker;
  let fixture: ComponentFixture<BackgroundPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackgroundPicker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackgroundPicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
