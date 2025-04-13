import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionListComponent } from '@views/page';
import { AppStoreModule } from '@core/store';
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
      imports: [AppStoreModule] // Импортируйте необходимые модули
    })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Компонент должен создаться', () => {
    expect(component).toBeTruthy();
  });

  it('Компонент должен отображать список операций', () => {
    expect(component['_operationsList']).not.toBe(undefined);
  });
});
