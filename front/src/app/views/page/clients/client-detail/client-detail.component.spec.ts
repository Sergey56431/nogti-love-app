import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ClientsService } from '@shared/services';
import { ClientDetailComponent } from './client-detail.component';
import { SnackStatusesUtil } from '@shared/utils';
import { ClientInfoType } from '@shared/types';

describe('ClientDetailComponent', () => {
  let component: ClientDetailComponent;
  let fixture: ComponentFixture<ClientDetailComponent>;
  let clientServiceSpy: jasmine.SpyObj<ClientsService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  const mockClient: ClientInfoType = {
    id: '123',
    name: 'John',
    lastName: 'Doe',
    rate: 4,
    description: 'Test client',
    score: 85
  };

  beforeEach(() => {
    clientServiceSpy = jasmine.createSpyObj('ClientsService', [
      'fetchAdminClient',
      'updateClientData'
    ]);
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      params: of({ id: '123' })
    });
    TestBed.configureTestingModule({
      providers: [
        { provide: ClientsService, useValue: clientServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    });
    fixture = TestBed.createComponent(ClientDetailComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('должен получать данные клиента при наличии id', () => {
      clientServiceSpy.fetchAdminClient.and.returnValue(of(mockClient));
      activatedRouteSpy.params = of({ id: '123' });
      component.ngOnInit();
      expect(clientServiceSpy.fetchAdminClient).toHaveBeenCalledWith('123');
      expect(component['_client']()).toBeTruthy();
      expect(component['_client']()?.id).toBe(mockClient.id);
    });
    it('не должен вызывать fetchAdminClient если id отсутствует', () => {
      activatedRouteSpy.params = of({});
      clientServiceSpy.fetchAdminClient.and.returnValue(of({}));
      component.ngOnInit();
      expect(clientServiceSpy.fetchAdminClient).not.toHaveBeenCalled();
    });
  });

  describe('_reset', () => {
    it('сбрасывает все поля формы в начальное состояние', () => {
      component['_newScore'].set(90);
      component['_clientRating'].set(5);
      component['_clientDescription'].set('Test description');
      component['_editMode'].set(true);
      component['_reset']();
      expect(component['_newScore']()).toBeNull();
      expect(component['_clientRating']()).toBe(0);
      expect(component['_clientDescription']()).toBe('');
      expect(component['_editMode']()).toBe(false);
    });
  });

  describe('_saveNewInfo', () => {
    it('вызывает ошибку, если не переданы данные', () => {
      component['_clientId'].set('123');
      clientServiceSpy.updateClientData.and.returnValue(of({}));
      component['_clientRating'].set(0);
      component['_clientDescription'].set('');
      component['_newScore'].set(null);
      component['_saveNewInfo']();
      expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'error',
        detail: 'Не указана информация для редактирования'
      }));
    });
    it('корректно формирует объект данных и вызывает updateClientData', () => {
      component['_clientId'].set('123');
      clientServiceSpy.updateClientData.and.returnValue(of({}));
      component['_clientRating'].set(4);
      component['_clientDescription'].set('New description');
      component['_newScore'].set(95);
      component['_saveNewInfo']();
      expect(clientServiceSpy.updateClientData).toHaveBeenCalledWith(
        '123',
        jasmine.objectContaining({
          rate: 4,
          description: 'New description',
          score: 95
        })
      );
    });
    it('обрабатывает частичное обновление', () => {
      component['_clientId'].set('123');
      clientServiceSpy.updateClientData.and.returnValue(of({}));
      component['_clientRating'].set(0);
      component['_clientDescription'].set('');
      component['_newScore'].set(80);
      component['_saveNewInfo']();
      expect(clientServiceSpy.updateClientData).toHaveBeenCalledWith(
        '123',
        jasmine.objectContaining({ score: 80 })
      );
    });
  });

  describe('_sendClientDescription', () => {
    it('обновляет клиента и показывает сообщение об успехе', () => {
      component['_clientId'].set('123');
      const updatedClient = { ...mockClient, rate: 5 };
      clientServiceSpy.updateClientData.and.returnValue(of(updatedClient));
      component['_sendClientDescription']({ rate: 5 });
      expect(component['_client']()).toEqual(updatedClient);
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'success' })
      );
    });
    it('показывает сообщение об ошибке при ошибке сервиса', () => {
      component['_clientId'].set('123');
      clientServiceSpy.updateClientData.and.returnValue(
        throwError(() => new Error('API error'))
      );
      clientServiceSpy.fetchAdminClient.and.returnValue(of({}));
      component['_sendClientDescription']({ rate: 5 });
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' })
      );
    });
  });

  describe('Edge Cases', () => {
    it('обрабатывает ситуацию, когда клиент не найден', () => {
      activatedRouteSpy.params = of({ id: '123' });
      clientServiceSpy.fetchAdminClient.and.returnValue(of(null as any));
      component.ngOnInit();
      expect(component['_client']()).toBeUndefined();
    });
    it('обрабатывает описание, состоящее только из пробелов', () => {
      activatedRouteSpy.params = of({ id: '123' });
      clientServiceSpy.updateClientData.and.returnValue(of({}));
      component.ngOnInit();
      component['_clientDescription'].set('   ');
      component['_newScore'].set(null);
      component['_clientRating'].set(0);
      component['_saveNewInfo']();
      expect(clientServiceSpy.updateClientData).toHaveBeenCalledWith(
        '123',
        jasmine.objectContaining({ description: '   ' })
      );
    });
    it('не должен отправлять невалидный тип score', () => {
      activatedRouteSpy.params = of({ id: '123' });
      clientServiceSpy.fetchAdminClient.and.returnValue(of({}));
      clientServiceSpy.updateClientData.and.returnValue(of({}));
      component.ngOnInit();
      component['_newScore'].set('invalid');
      component['_clientRating'].set(0);
      component['_clientDescription'].set('');
      component['_saveNewInfo']();
      const allArgs = clientServiceSpy.updateClientData.calls.allArgs();
      const wasCalledWithInvalid = allArgs.some(args => typeof args[1]?.score === 'string');
      expect(wasCalledWithInvalid).toBeFalse();
    });
  });
});