import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisenadorConsultas } from './disenador-consultas';

describe('DisenadorConsultas', () => {
  let component: DisenadorConsultas;
  let fixture: ComponentFixture<DisenadorConsultas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisenadorConsultas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisenadorConsultas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
