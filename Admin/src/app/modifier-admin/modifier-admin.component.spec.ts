import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierAdminComponent } from './modifier-admin.component';

describe('ModifierAdminComponent', () => {
  let component: ModifierAdminComponent;
  let fixture: ComponentFixture<ModifierAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModifierAdminComponent]
    });
    fixture = TestBed.createComponent(ModifierAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
