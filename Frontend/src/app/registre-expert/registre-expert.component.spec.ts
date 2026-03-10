import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistreExpertComponent } from './registre-expert.component';

describe('RegistreExpertComponent', () => {
  let component: RegistreExpertComponent;
  let fixture: ComponentFixture<RegistreExpertComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistreExpertComponent]
    });
    fixture = TestBed.createComponent(RegistreExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
