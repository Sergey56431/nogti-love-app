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
    it('should fetch client data when route ID changes', () => {
      // Arrange
      clientServiceSpy.fetchAdminClient.and.returnValue(of(mockClient));

      // Act
      component.ngOnInit();

      // Assert
      expect(clientServiceSpy.fetchAdminClient).toHaveBeenCalledWith('123');
      expect((component as any)._client()).toEqual(mockClient);
    });

    it('should handle missing route ID', () => {
      // Arrange
      activatedRouteSpy.params = of({});
      clientServiceSpy.fetchAdminClient.and.returnValue(of(mockClient));

      // Act
      component.ngOnInit();

      // Assert
      expect(clientServiceSpy.fetchAdminClient).not.toHaveBeenCalled();
    });
  });

  describe('_reset', () => {
    it('should reset all form fields to initial state', () => {
      // Arrange
      (component as any)._newScore.set(90);
      (component as any)._clientRating.set(5);
      (component as any)._clientDescription.set('Test description');
      (component as any)._editMode.set(true);

      // Act
      (component as any)._reset();

      // Assert
      expect((component as any)._newScore()).toBe(null);
      expect((component as any)._clientRating()).toBe(0);
      expect((component as any)._clientDescription()).toBe('');
      expect((component as any)._editMode()).toBeFalse();
    });
  });

  describe('_saveNewInfo', () => {
    it('should show error when no data provided', () => {
      // Act
      (component as any)._saveNewInfo();

      // Assert
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          summary: 'Не указана информация для редактирования'
        })
      );
    });

    it('should construct data object correctly', () => {
      // Arrange
      (component as any)._clientRating.set(4);
      (component as any)._clientDescription.set('New description');
      (component as any)._newScore.set(95);

      // Act
      (component as any)._saveNewInfo();

      // Assert
      expect(clientServiceSpy.updateClientData).toHaveBeenCalledWith(
        '123',
        jasmine.objectContaining({
          rate: 4,
          description: 'New description',
          score: 95
        })
      );
    });

    it('should handle partial updates', () => {
      // Arrange
      (component as any)._clientRating.set(0);
      (component as any)._clientDescription.set('');
      (component as any)._newScore.set(80);

      // Act
      (component as any)._saveNewInfo();

      // Assert
      expect(clientServiceSpy.updateClientData).toHaveBeenCalledWith(
        '123',
        jasmine.objectContaining({ score: 80 })
      );
    });
  });

  describe('_sendClientDescription', () => {
    it('should update client and show success message on success', () => {
      // Arrange
      const updatedClient = { ...mockClient, rate: 5 };
      clientServiceSpy.updateClientData.and.returnValue(of(updatedClient));

      // Act
      (component as any)._sendClientDescription({ rate: 5 });

      // Assert
      expect((component as any)._client()).toEqual(updatedClient);
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'success' })
      );
    });

    it('should show error message on service failure', () => {
      // Arrange
      clientServiceSpy.updateClientData.and.returnValue(
        throwError(() => new Error('API error'))
      );

      // Act
      (component as any)._sendClientDescription({ rate: 5 });

      // Assert
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle client not found', () => {
      // Arrange
      clientServiceSpy.fetchAdminClient.and.returnValue(of(null as any));

      // Act
      component.ngOnInit();

      // Assert
      expect((component as any)._client()).toBe(undefined);
    });

    it('should handle whitespace in description', () => {
      // Arrange
      (component as any)._clientDescription.set('   ');

      // Act
      (component as any)._saveNewInfo();

      // Assert
      expect(clientServiceSpy.updateClientData).toHaveBeenCalledWith(
        '123',
        jasmine.objectContaining({ description: '   ' })
      );
    });

    it('should handle invalid score type', () => {
      // Arrange
      (component as any)._newScore.set('invalid');

      // Act
      (component as any)._saveNewInfo();

      // Assert
      const allArgs = clientServiceSpy.updateClientData.calls.allArgs();
      const wasCalledWithInvalid = allArgs.some(args => typeof args[1]?.score === 'string');
      expect(wasCalledWithInvalid).toBeFalse();
    });
  });
});
