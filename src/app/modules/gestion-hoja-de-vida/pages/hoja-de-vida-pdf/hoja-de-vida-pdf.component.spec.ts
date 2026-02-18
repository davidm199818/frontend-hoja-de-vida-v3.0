import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HojaDeVidaPdfComponent } from './hoja-de-vida-pdf.component';

describe('HojaDeVidaPdfComponent', () => {
  let component: HojaDeVidaPdfComponent;
  let fixture: ComponentFixture<HojaDeVidaPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HojaDeVidaPdfComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HojaDeVidaPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
