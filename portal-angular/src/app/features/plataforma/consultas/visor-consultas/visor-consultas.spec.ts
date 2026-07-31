import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorConsultas } from './visor-consultas';

describe('VisorConsultas', () => {
  let component: VisorConsultas;
  let fixture: ComponentFixture<VisorConsultas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisorConsultas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisorConsultas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
