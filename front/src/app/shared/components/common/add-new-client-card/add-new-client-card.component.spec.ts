import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewClientCardComponent } from './add-new-client-card.component';

describe('AddNewClientCardComponent', () => {
  let component: AddNewClientCardComponent;
  let fixture: ComponentFixture<AddNewClientCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewClientCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewClientCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
