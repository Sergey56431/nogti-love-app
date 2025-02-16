import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationsCategoryComponent } from './operations-category.component';

describe('OperationsCategoryComponent', () => {
  let component: OperationsCategoryComponent;
  let fixture: ComponentFixture<OperationsCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationsCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationsCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
