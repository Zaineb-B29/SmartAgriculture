import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginExpertComponent } from './login-expert.component';

describe('LoginExpertComponent', () => {
  let component: LoginExpertComponent;
  let fixture: ComponentFixture<LoginExpertComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginExpertComponent]
    });
    fixture = TestBed.createComponent(LoginExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
