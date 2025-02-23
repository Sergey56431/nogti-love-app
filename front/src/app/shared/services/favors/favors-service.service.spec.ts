import { TestBed } from '@angular/core/testing';

import { FavorsService } from './favors-service';

describe('FavorsServiceService', () => {
  let service: FavorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
