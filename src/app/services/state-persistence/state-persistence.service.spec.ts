import { TestBed } from '@angular/core/testing';

import { StatePersistenceService } from './state-persistence.service';

describe('StatePersistenceService', () => {
  let service: StatePersistenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatePersistenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
