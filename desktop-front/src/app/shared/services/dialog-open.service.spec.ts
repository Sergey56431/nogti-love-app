import { TestBed } from '@angular/core/testing';

import { DialogOpenService } from './dialog-open.service';

describe('DialogOpenService', () => {
  let service: DialogOpenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogOpenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
