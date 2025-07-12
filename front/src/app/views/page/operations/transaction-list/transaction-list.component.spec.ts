import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionListComponent } from './transaction-list.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '@core/auth';

describe('Список Операций', () => {
  let component: TransactionListComponent;
  let fixture: ComponentFixture<TransactionListComponent>;

  beforeEach(async () => {
    const paramsMock = {
      activatedParam: jasmine.createSpy('_activatedRoute').and.returnValue(of({ params: of({ period: 'all', type: 'all' }) }))
    };

    await TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler,
        {
          provide: ActivatedRoute,
          useValue: paramsMock
        },
        AuthService // Убедитесь, что вы предоставляете AuthService
      ],
      // imports: [AppStoreModule] // Удалено, так как модуль не существует
    })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Компонент должен создаться', () => {
    expect(!!component).toBe(true);
  });

  it('Компонент должен отображать список операций', () => {
    expect((component as any)._operationsList).not.toBeUndefined();
  });
});
