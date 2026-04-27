import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviEvolutionComponent } from './suivi-evolution.component';

describe('SuiviEvolutionComponent', () => {
  let component: SuiviEvolutionComponent;
  let fixture: ComponentFixture<SuiviEvolutionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuiviEvolutionComponent]
    });
    fixture = TestBed.createComponent(SuiviEvolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
