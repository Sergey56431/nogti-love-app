import { TestBed } from '@angular/core/testing';

import { FavorsServiceService } from './favors-service.service';

describe('FavorsServiceService', () => {
  let service: FavorsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavorsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
