import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, User, LoginCredentials } from './auth.service';
import { CONSTANTES } from '../../constantes';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUsers: User[] = [
    {
      id: 1,
      email: 'admin@example.com',
      password: 'password123',
      name: 'Admin User',
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        phone: '123456789',
        department: 'IT',
        position: 'Administrator',
        joinDate: '2024-01-01',
        bio: 'Admin bio',
        skills: ['Angular', 'TypeScript'],
        avatar: 'admin.jpg'
      }
    },
    {
      id: 2,
      email: 'user@example.com',
      password: 'password456',
      name: 'Regular User',
      role: 'user',
      profile: {
        firstName: 'Regular',
        lastName: 'User',
        phone: '987654321',
        department: 'Sales',
        position: 'Analyst',
        joinDate: '2024-02-01',
        bio: 'User bio',
        skills: ['Communication'],
        avatar: 'user.jpg'
      }
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    }).compileComponents();

    // Clear localStorage before each test
    localStorage.clear();
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('should return user on successful login', (done) => {
      const credentials: LoginCredentials = { email: 'admin@example.com', password: 'password123' };

      service.login(credentials).subscribe(user => {
        expect(user).toBeTruthy();
        expect(user?.email).toBe('admin@example.com');
        expect(user?.role).toBe('admin');
        done();
      });

      const req = httpMock.expectOne('assets/data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should return null on failed login', (done) => {
      const credentials: LoginCredentials = { email: 'wrong@example.com', password: 'wrongpassword' };

      service.login(credentials).subscribe(user => {
        expect(user).toBeNull();
        done();
      });

      const req = httpMock.expectOne('assets/data/users.json');
      req.flush(mockUsers);
    });

    it('should save user to localStorage on successful login', (done) => {
      const credentials: LoginCredentials = { email: 'user@example.com', password: 'password456' };

      service.login(credentials).subscribe(() => {
        const storedUser = localStorage.getItem(CONSTANTES.STORAGE.USER);
        expect(storedUser).toBeTruthy();
        const parsedUser = JSON.parse(storedUser!);
        expect(parsedUser.email).toBe('user@example.com');
        done();
      });

      const req = httpMock.expectOne('assets/data/users.json');
      req.flush(mockUsers);
    });

    it('should handle HTTP errors gracefully', (done) => {
      const credentials: LoginCredentials = { email: 'admin@example.com', password: 'password123' };

      service.login(credentials).subscribe(user => {
        expect(user).toBeNull();
        done();
      });

      const req = httpMock.expectOne('assets/data/users.json');
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('logout', () => {
    it('should clear currentUser and remove from localStorage', () => {
      // Set up user in storage
      localStorage.setItem(CONSTANTES.STORAGE.USER, JSON.stringify(mockUsers[0]));

      // Set currentUser through login first
      const credentials: LoginCredentials = { email: 'admin@example.com', password: 'password123' };
      service.login(credentials).subscribe(() => {
        service.logout();

        expect(service.getCurrentUser()).toBeNull();
        expect(localStorage.getItem(CONSTANTES.STORAGE.USER)).toBeNull();
      });

      const req = httpMock.expectOne('assets/data/users.json');
      req.flush(mockUsers);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is logged in', () => {
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no user is logged in', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return true when user is logged in', (done) => {
      const credentials: LoginCredentials = { email: 'user@example.com', password: 'password456' };

      service.login(credentials).subscribe(() => {
        expect(service.isAuthenticated()).toBeTrue();
        done();
      });

      const req = httpMock.expectOne('assets/data/users.json');
      req.flush(mockUsers);
    });
  });

  describe('hasRole', () => {
    it('should return false when user is not logged in', () => {
      expect(service.hasRole('admin')).toBeFalse();
    });

    it('should return true when user has required role', (done) => {
      const credentials: LoginCredentials = { email: 'admin@example.com', password: 'password123' };

      service.login(credentials).subscribe(() => {
        expect(service.hasRole('admin')).toBeTrue();
        done();
      });

      const req = httpMock.expectOne('assets/data/users.json');
      req.flush(mockUsers);
    });

    it('should return false when user does not have required role', (done) => {
      const credentials: LoginCredentials = { email: 'user@example.com', password: 'password456' };

      service.login(credentials).subscribe(() => {
        expect(service.hasRole('admin')).toBeFalse();
        expect(service.hasRole('user')).toBeTrue();
        done();
      });

      const req = httpMock.expectOne('assets/data/users.json');
      req.flush(mockUsers);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', (done) => {
      service.getAllUsers().subscribe(users => {
        expect(users).toEqual(mockUsers);
        expect(users.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne('assets/data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
  });
});
