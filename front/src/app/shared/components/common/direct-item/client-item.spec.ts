import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectItem } from './client-item';

describe('ClientItem', () => {
  let component: DirectItem;
  let fixture: ComponentFixture<DirectItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
