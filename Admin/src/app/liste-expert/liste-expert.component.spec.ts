import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeExpertComponent } from './liste-expert.component';

describe('ListeExpertComponent', () => {
  let component: ListeExpertComponent;
  let fixture: ComponentFixture<ListeExpertComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListeExpertComponent]
    });
    fixture = TestBed.createComponent(ListeExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
