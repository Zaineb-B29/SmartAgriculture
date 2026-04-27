import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierBesoinComponent } from './modifier-besoin.component';

describe('ModifierBesoinComponent', () => {
  let component: ModifierBesoinComponent;
  let fixture: ComponentFixture<ModifierBesoinComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModifierBesoinComponent]
    });
    fixture = TestBed.createComponent(ModifierBesoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
