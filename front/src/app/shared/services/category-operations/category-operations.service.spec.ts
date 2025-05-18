import { TestBed } from '@angular/core/testing';

import { CategoryOperationsService } from './category-operations.service';

describe('CategoryOperationsService', () => {
  let service: CategoryOperationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryOperationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
