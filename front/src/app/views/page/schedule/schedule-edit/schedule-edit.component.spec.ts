import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScheduleEditComponent } from '@views/page';

describe('ScheduleEditComponent', () => {
  let component: ScheduleEditComponent;
  let fixture: ComponentFixture<ScheduleEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component['_date'].set('04.2025');
    expect(component['_date']()).not.toBe('');
  });
});
