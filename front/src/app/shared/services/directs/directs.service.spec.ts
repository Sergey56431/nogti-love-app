import { TestBed } from '@angular/core/testing';

import { DirectsService } from './directs.service';

describe('DirectsService', () => {
  let service: DirectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
