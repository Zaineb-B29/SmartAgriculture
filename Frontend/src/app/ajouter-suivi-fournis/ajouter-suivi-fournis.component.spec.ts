import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterSuiviFournisComponent } from './ajouter-suivi-fournis.component';

describe('AjouterSuiviFournisComponent', () => {
  let component: AjouterSuiviFournisComponent;
  let fixture: ComponentFixture<AjouterSuiviFournisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AjouterSuiviFournisComponent]
    });
    fixture = TestBed.createComponent(AjouterSuiviFournisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
