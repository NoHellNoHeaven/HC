import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoferesComponent } from './chofer.component';

describe('ChoferesComponent', () => {
  let component: ChoferesComponent;
  let fixture: ComponentFixture<ChoferesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoferesComponent], // porque es standalone o componente
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChoferesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
