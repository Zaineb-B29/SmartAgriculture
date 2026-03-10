import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFournisseurComponent } from './login-fournisseur.component';

describe('LoginFournisseurComponent', () => {
  let component: LoginFournisseurComponent;
  let fixture: ComponentFixture<LoginFournisseurComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginFournisseurComponent]
    });
    fixture = TestBed.createComponent(LoginFournisseurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
