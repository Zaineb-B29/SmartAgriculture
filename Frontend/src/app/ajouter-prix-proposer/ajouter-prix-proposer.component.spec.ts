import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterPrixProposerComponent } from './ajouter-prix-proposer.component';

describe('AjouterPrixProposerComponent', () => {
  let component: AjouterPrixProposerComponent;
  let fixture: ComponentFixture<AjouterPrixProposerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AjouterPrixProposerComponent]
    });
    fixture = TestBed.createComponent(AjouterPrixProposerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
