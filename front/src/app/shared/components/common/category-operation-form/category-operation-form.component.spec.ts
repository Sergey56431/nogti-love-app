import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryOperationFormComponent } from './category-operation-form.component';

describe('CategoryOperationFormComponent', () => {
  let component: CategoryOperationFormComponent;
  let fixture: ComponentFixture<CategoryOperationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryOperationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryOperationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
