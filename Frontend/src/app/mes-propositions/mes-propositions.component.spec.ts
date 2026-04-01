import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesPropositionsComponent } from './mes-propositions.component';

describe('MesPropositionsComponent', () => {
  let component: MesPropositionsComponent;
  let fixture: ComponentFixture<MesPropositionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MesPropositionsComponent]
    });
    fixture = TestBed.createComponent(MesPropositionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
