import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavorsPageComponent } from './favors-page.component';

describe('FavorsPageComponent', () => {
  let component: FavorsPageComponent;
  let fixture: ComponentFixture<FavorsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavorsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
