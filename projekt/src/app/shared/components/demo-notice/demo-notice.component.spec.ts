import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoNoticeComponent } from './demo-notice.component';

describe('DemoNoticeComponent', () => {
  let fixture: ComponentFixture<DemoNoticeComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DemoNoticeComponent);
    fixture.componentRef.setInput('text', 'Abhaken geht noch nicht.');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the passed explanation', () => {
    expect(fixture.nativeElement.textContent).toContain('Abhaken geht noch nicht.');
  });
});
