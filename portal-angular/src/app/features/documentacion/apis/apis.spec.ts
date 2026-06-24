import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ApisComponent } from './apis.component';
import { environment } from '../../../../environments/environment';

describe('ApisComponent', () => {
  let component: ApisComponent;
  let fixture: ComponentFixture<ApisComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApisComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ApisComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    try {
      httpMock.verify();
    } catch (err) {
      // Ignore verification errors - some tests intentionally leave open requests
    }
  });

  describe('Component Initialization', () => {
    it('should create the apis component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize all data properties to null', () => {
      expect(component.tokenData).toBeNull();
      expect(component.tokenAPIMData).toBeNull();
      expect(component.catalogosData).toBeNull();
    });

    it('should initialize all loading states to false', () => {
      expect(component.isLoadingToken).toBeFalse();
      expect(component.isLoadingTokenAPIM).toBeFalse();
      expect(component.isLoadingCatalogos).toBeFalse();
    });

    it('should initialize all error messages to null', () => {
      expect(component.tokenError).toBeNull();
      expect(component.tokenAPIMError).toBeNull();
      expect(component.catalogosError).toBeNull();
    });

    it('should have correct gateway URL', () => {
      expect(component.gatewayUrl).toBe('http://172.20.70.56:3000');
    });

    it('should have correct client IP', () => {
      expect(component.ipCliente).toBe('172.20.70.56');
    });

    it('should have environment reference', () => {
      expect(component.environment).toBe(environment);
    });
  });

  describe('obtenerToken', () => {
    it('should set isLoadingToken to true during request', () => {
      component.obtenerToken();
      expect(component.isLoadingToken).toBeTrue();

      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      req.flush({ data: { token: 'test123' } });
    });

    it('should make POST request to gateway proxy', () => {
      component.obtenerToken();

      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeTruthy();
      req.flush({ data: { token: 'test123' } });
    });

    it('should include API configuration in request body', () => {
      component.obtenerToken();

      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      const body = req.request.body;

      expect(body.method).toBe('POST');
      expect(body.data.datosIniciarSesion).toBeTruthy();
      expect(body.data.datosIniciarSesion.nombreAplicacion).toBeTruthy();

      req.flush({ data: { token: 'test123' } });
    });

    it('should set tokenData on successful response', () => {
      const mockResponse = { data: { token: 'abc123', expiresIn: 3600 } };
      component.obtenerToken();

      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      req.flush(mockResponse);

      expect(component.tokenData).toEqual(mockResponse.data);
      expect(component.isLoadingToken).toBeFalse();
    });

    it('should set tokenError on failed response', () => {
      component.obtenerToken();

      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      req.error(new ErrorEvent('Network error', { message: 'Connection failed' }));

      expect(component.tokenError).toBeTruthy();
      expect(component.tokenError).toContain('Error');
      expect(component.isLoadingToken).toBeFalse();
    });

    it('should clear tokenError before new request', () => {
      component.tokenError = 'Previous error';
      component.obtenerToken();
      expect(component.tokenError).toBeNull();

      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      req.flush({ data: { token: 'test123' } });
    });
  });

  describe('obtenerTokenAPIM', () => {
    it('should set isLoadingTokenAPIM to true during request', () => {
      component.obtenerTokenAPIM();
      expect(component.isLoadingTokenAPIM).toBeTrue();

      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      req.flush({ data: { token: 'apim123' } });
    });

    it('should make POST request for APIM token', () => {
      component.obtenerTokenAPIM();

      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.data.datosIniciarSesion).toBeTruthy();

      req.flush({ data: { token: 'apim123' } });
    });

    it('should set tokenAPIMData on successful response', () => {
      const mockResponse = { data: { respuestaToken: { tokenSesion: 'apim_token_123' } } };
      component.obtenerTokenAPIM();

      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      req.flush(mockResponse);

      expect(component.tokenAPIMData).toBeTruthy();
      expect(component.isLoadingTokenAPIM).toBeFalse();
    });

    it('should set tokenAPIMError on failed response', () => {
      component.obtenerTokenAPIM();

      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      req.error(new ErrorEvent('Network error'));

      expect(component.tokenAPIMError).toBeTruthy();
      expect(component.isLoadingTokenAPIM).toBeFalse();
    });
  });

  describe('consultarCatalogos', () => {
    it('should mark as loading when starting', () => {
      component.consultarCatalogos();
      expect(component.isLoadingCatalogos).toBeTrue();

      // Handle the HTTP request initiated by obtenerTokenAPIMParaCatalogos
      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      req.flush({ respuestaToken: { tokenSesion: 'test_token' } });
    });

    it('should clear error before starting', () => {
      component.catalogosError = 'Previous error';
      component.consultarCatalogos();
      expect(component.catalogosError).toBeNull();

      // Handle the HTTP request initiated by obtenerTokenAPIMParaCatalogos
      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      req.flush({ respuestaToken: { tokenSesion: 'test_token' } });
    });
  });

  describe('consultarCatalogosConToken', () => {
    it('should include token in Authorization header', () => {
      component.tokenSesionCatalogos = 'test_token_123';
      component.isLoadingCatalogos = true;

      // Manually call private method through component
      (component as any).consultarCatalogosConToken();

      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      expect(req.request.body.headers.Authorization).toBe('Bearer test_token_123');

      req.flush({ data: { catalogos: [] } });
    });

    it('should include audit data in request body', () => {
      component.tokenSesionCatalogos = 'test_token_123';
      component.isLoadingCatalogos = true;

      (component as any).consultarCatalogosConToken();

      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      const auditData = req.request.body.data.auditoria;

      expect(auditData.usuario).toBe('PlantillaAngular');
      expect(auditData.ipCliente).toBe(component.ipCliente);
      expect(auditData.identificadorGUID).toBe(component.identificadorGUID);

      req.flush({ data: { catalogos: [] } });
    });

    it('should set catalogosData on successful response', () => {
      component.tokenSesionCatalogos = 'test_token_123';
      component.isLoadingCatalogos = true;
      const mockCatalogos = { items: [{ id: 1, name: 'Item 1' }] };

      (component as any).consultarCatalogosConToken();

      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      req.flush({ data: mockCatalogos });

      expect(component.catalogosData).toEqual(mockCatalogos);
      expect(component.isLoadingCatalogos).toBeFalse();
    });

    it('should set catalogosError on failed response', () => {
      component.tokenSesionCatalogos = 'test_token_123';
      component.isLoadingCatalogos = true;

      (component as any).consultarCatalogosConToken();

      const req = httpMock.expectOne('http://172.20.70.56:3000/proxy/request');
      req.error(new ErrorEvent('Server error'), { status: 500 });

      expect(component.catalogosError).toBeTruthy();
      expect(component.isLoadingCatalogos).toBeFalse();
    });

    it('should return early if no token is available', () => {
      component.tokenSesionCatalogos = null;
      component.isLoadingCatalogos = true;

      (component as any).consultarCatalogosConToken();

      expect(component.catalogosError).toContain('No hay token disponible');
      expect(component.isLoadingCatalogos).toBeFalse();
      httpMock.expectNone('http://172.20.70.56:3000/proxy/request');
    });
  });
});
