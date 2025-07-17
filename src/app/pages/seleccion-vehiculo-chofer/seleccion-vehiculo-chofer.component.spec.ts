import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SeleccionVehiculoChoferComponent } from './seleccion-vehiculo-chofer.component';

describe('SeleccionVehiculoChoferComponent', () => {
  let component: SeleccionVehiculoChoferComponent;
  let fixture: ComponentFixture<SeleccionVehiculoChoferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SeleccionVehiculoChoferComponent,
        HttpClientTestingModule // Importa para el HttpClient
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SeleccionVehiculoChoferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
