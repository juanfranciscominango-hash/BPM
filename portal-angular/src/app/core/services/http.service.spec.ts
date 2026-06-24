import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { HttpService, ApiResponse } from './http.service';

describe('HttpService', () => {
  let service: HttpService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService]
    }).compileComponents();

    service = TestBed.inject(HttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('get', () => {
    it('should return successful response with data', (done) => {
      const testUrl = '/api/users';
      const mockData = { id: 1, name: 'John Doe' };

      service.get(testUrl).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.data).toEqual(mockData);
        expect(response.statusCode).toBe(200);
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should include default headers in GET request', () => {
      const testUrl = '/api/users';
      const mockData: any[] = [];

      service.get(testUrl).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      req.flush(mockData);
    });

    it('should merge custom headers with default headers', () => {
      const testUrl = '/api/users';
      const customHeaders = new HttpHeaders({ 'Authorization': 'Bearer token123' });
      const mockData: any[] = [];

      service.get(testUrl, { headers: customHeaders }).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('Authorization')).toBe('Bearer token123');
      req.flush(mockData);
    });

    it('should include query parameters', () => {
      const testUrl = '/api/users';
      const params = new HttpParams().set('page', '1').set('limit', '10');
      const mockData: any[] = [];

      service.get(testUrl, { params }).subscribe();

      const req = httpMock.expectOne(request => request.url === testUrl && request.params.get('page') === '1');
      expect(req.request.params.get('limit')).toBe('10');
      req.flush(mockData);
    });

    it('should handle error response', (done) => {
      const testUrl = '/api/users';

      service.get(testUrl).subscribe(
        () => {},
        (error: ApiResponse) => {
          expect(error.success).toBeFalse();
          expect(error.statusCode).toBe(500);
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.flush(
        { message: 'Server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });

  describe('post', () => {
    it('should send POST request with body', (done) => {
      const testUrl = '/api/users';
      const payload = { name: 'John Doe', email: 'john@example.com' };
      const mockResponse = { id: 1, ...payload };

      service.post(testUrl, payload).subscribe(response => {
        expect(response.success).toBeTrue();
        expect(response.data).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });

    it('should send POST request with null body', (done) => {
      const testUrl = '/api/users/trigger';

      service.post(testUrl, null).subscribe(response => {
        expect(response.success).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(testUrl);
      expect(req.request.body).toBeNull();
      req.flush({});
    });

    it('should include headers in POST request', () => {
      const testUrl = '/api/users';
      const payload = { name: 'John Doe' };
      const customHeaders = new HttpHeaders({ 'X-Custom-Header': 'custom-value' });

      service.post(testUrl, payload, { headers: customHeaders }).subscribe();

      const req = httpMock.expectOne(testUrl);
      expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');
      req.flush({});
    });

    it('should handle POST error response', (done) => {
      const testUrl = '/api/users';
      const payload = { name: '' };

      service.post(testUrl, payload).subscribe(
        () => {},
        (error: ApiResponse) => {
          expect(error.success).toBeFalse();
          expect(error.statusCode).toBe(400);
          expect(error.error).toBe('Datos incorrectos');
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.flush(
        { message: 'Invalid data' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  describe('error handling', () => {
    it('should return 401 error message for unauthorized', (done) => {
      const testUrl = '/api/protected';

      service.get(testUrl).subscribe(
        () => {},
        (error: ApiResponse) => {
          expect(error.error).toBe('No autorizado');
          expect(error.statusCode).toBe(401);
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.flush(null, { status: 401, statusText: 'Unauthorized' });
    });

    it('should return 403 error message for forbidden', (done) => {
      const testUrl = '/api/admin';

      service.get(testUrl).subscribe(
        () => {},
        (error: ApiResponse) => {
          expect(error.error).toBe('Acceso denegado');
          expect(error.statusCode).toBe(403);
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.flush(null, { status: 403, statusText: 'Forbidden' });
    });

    it('should return 404 error message for not found', (done) => {
      const testUrl = '/api/users/999';

      service.get(testUrl).subscribe(
        () => {},
        (error: ApiResponse) => {
          expect(error.error).toBe('No encontrado');
          expect(error.statusCode).toBe(404);
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.flush(null, { status: 404, statusText: 'Not Found' });
    });

    it('should handle network errors', (done) => {
      const testUrl = '/api/users';

      service.get(testUrl).subscribe(
        () => {},
        (error: ApiResponse) => {
          expect(error.success).toBeFalse();
          expect(error.error).toContain('Error de conexión');
          done();
        }
      );

      const req = httpMock.expectOne(testUrl);
      req.error(new ErrorEvent('Network error', { message: 'Connection failed' }));
    });
  });
});
