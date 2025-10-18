import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDescription } from './task-description';

describe('TaskDescription', () => {
  let component: TaskDescription;
  let fixture: ComponentFixture<TaskDescription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDescription]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDescription);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
