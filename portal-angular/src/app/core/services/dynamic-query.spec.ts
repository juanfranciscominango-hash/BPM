import { TestBed } from '@angular/core/testing';

import { DynamicQuery } from './dynamic-query';

describe('DynamicQuery', () => {
  let service: DynamicQuery;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicQuery);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
