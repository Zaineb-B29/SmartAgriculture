import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeBesoinEnAttenteComponent } from './liste-besoin-en-attente.component';

describe('ListeBesoinEnAttenteComponent', () => {
  let component: ListeBesoinEnAttenteComponent;
  let fixture: ComponentFixture<ListeBesoinEnAttenteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListeBesoinEnAttenteComponent]
    });
    fixture = TestBed.createComponent(ListeBesoinEnAttenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
