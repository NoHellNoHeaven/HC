import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoferComponent } from './chofer.component';

describe('ChoferComponent', () => {
  let component: ChoferComponent;
  let fixture: ComponentFixture<ChoferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChoferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
