import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantencionesPendientesComponent } from './mantenciones-pendientes.component';

describe('MantencionesPendientesComponent', () => {
  let component: MantencionesPendientesComponent;
  let fixture: ComponentFixture<MantencionesPendientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantencionesPendientesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantencionesPendientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
