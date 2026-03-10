import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierExpertComponent } from './modifier-expert.component';

describe('ModifierExpertComponent', () => {
  let component: ModifierExpertComponent;
  let fixture: ComponentFixture<ModifierExpertComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModifierExpertComponent]
    });
    fixture = TestBed.createComponent(ModifierExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
