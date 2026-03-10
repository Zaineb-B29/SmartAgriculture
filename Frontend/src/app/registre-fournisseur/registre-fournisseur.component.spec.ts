import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistreFournisseurComponent } from './registre-fournisseur.component';

describe('RegistreFournisseurComponent', () => {
  let component: RegistreFournisseurComponent;
  let fixture: ComponentFixture<RegistreFournisseurComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistreFournisseurComponent]
    });
    fixture = TestBed.createComponent(RegistreFournisseurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
