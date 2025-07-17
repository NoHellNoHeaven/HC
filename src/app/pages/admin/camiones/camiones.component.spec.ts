import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CamionesComponent } from './camiones.component';


describe('CamionesComponent', () => {
  let component: CamionesComponent;
  let fixture: ComponentFixture<CamionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CamionesComponent,
        HttpClientTestingModule, // IMPORTANTE para HttpClient
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CamionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
