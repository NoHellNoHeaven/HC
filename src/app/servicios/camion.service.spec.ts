import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CamionService } from './camion.service';

describe('CamionService', () => {
  let service: CamionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]  // Importante para HttpClient
    });
    service = TestBed.inject(CamionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
