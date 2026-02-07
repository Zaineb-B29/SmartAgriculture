import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterExpertComponent } from './ajouter-expert.component';

describe('AjouterExpertComponent', () => {
  let component: AjouterExpertComponent;
  let fixture: ComponentFixture<AjouterExpertComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AjouterExpertComponent]
    });
    fixture = TestBed.createComponent(AjouterExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
