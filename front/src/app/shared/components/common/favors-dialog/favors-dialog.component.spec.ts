import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavorsDialogComponent } from './favors-dialog.component';

describe('FavorsDialogComponent', () => {
  let component: FavorsDialogComponent;
  let fixture: ComponentFixture<FavorsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavorsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavorsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
