import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePickerComponent } from './date-picker.component';
import { MessageService } from 'primeng/api';
import { CalendarService, DirectsService } from '@shared/services';
import { AuthService } from '@core/auth';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CalendarResponse } from '@shared/types';
import { NgxsModule } from '@ngxs/store';

// Вспомогательный интерфейс только для тестов, не расширяет напрямую класс!
interface DatePickerComponentTestAccess {
  _mountCount: { set: (v: number) => void; (): number };
  _yearCount: { set: (v: number) => void; (): number };
  _month: string;
  _day: string;
  _updateCalendarState: () => void;
  _generateDaysInMonth: (month: number, year: number) => void;
  _setStateOfDate: (calendar: CalendarResponse[]) => void;
}

describe('DatePickerComponent', () => {
    let component: DatePickerComponent;
    let fixture: ComponentFixture<DatePickerComponent>;
    let calendarServiceSpy: jasmine.SpyObj<CalendarService>;
    let directsServiceSpy: jasmine.SpyObj<DirectsService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let messageServiceSpy: jasmine.SpyObj<MessageService>;

    beforeEach(async () => {
        calendarServiceSpy = jasmine.createSpyObj('CalendarService', ['fetchCalendarByUser']);
        directsServiceSpy = jasmine.createSpyObj('DirectsService', ['fetchDirectsByDateUser']);
        authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserInfo']);
        messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

        await TestBed.configureTestingModule({
            imports: [DatePickerComponent, NgxsModule.forRoot([])],
            providers: [
                { provide: CalendarService, useValue: calendarServiceSpy },
                { provide: DirectsService, useValue: directsServiceSpy },
                { provide: AuthService, useValue: authServiceSpy },
                { provide: MessageService, useValue: messageServiceSpy },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DatePickerComponent);
        component = fixture.componentInstance;
    });

    it('должен создаваться', () => {
        expect(component).toBeTruthy();
    });

    it('должен корректно инициализироваться', () => {
        const calendarMock: CalendarResponse[] = [];
        authServiceSpy.getUserInfo.and.returnValue({ userId: '1' });
        calendarServiceSpy.fetchCalendarByUser.and.returnValue(of(calendarMock));
        component.ngOnInit();
        const testComponent = component as unknown as DatePickerComponentTestAccess;
        expect(testComponent._month !== '').toBeTruthy();
        expect(testComponent._day).toEqual('');
    });

    it('должен переключать месяц вперёд', () => {
        const testComponent = component as unknown as DatePickerComponentTestAccess;
        testComponent._mountCount.set(12);
        testComponent._yearCount.set(2023);
        const updateSpy = spyOn(testComponent, '_updateCalendarState');
        component.changeMonth('next');
        expect(testComponent._mountCount()).toEqual(1);
        expect(testComponent._yearCount()).toEqual(2024);
        expect(updateSpy.calls.any()).toBeTruthy();
    });

    it('должен переключать месяц назад', () => {
        const testComponent = component as unknown as DatePickerComponentTestAccess;
        testComponent._mountCount.set(1);
        testComponent._yearCount.set(2023);
        const updateSpy = spyOn(testComponent, '_updateCalendarState');
        component.changeMonth('prev');
        expect(testComponent._mountCount()).toEqual(12);
        expect(testComponent._yearCount()).toEqual(2022);
        expect(updateSpy.calls.any()).toBeTruthy();
    });

    it('должен эмитить событие при выборе дня', () => {
        const testComponent = component as unknown as DatePickerComponentTestAccess;
        const emitSpy = spyOn(component.emitDate, 'emit');
        const fetchSpy = spyOn(component, 'fetchDirectsToDay');
        testComponent._mountCount.set(5);
        testComponent._yearCount.set(2023);
        testComponent._month = 'Май';
        component.selectDayByNumber(10);
        expect(emitSpy.calls.any()).toBeTruthy();
        expect(testComponent._day.includes('10')).toBeTruthy();
        expect(fetchSpy.calls.any()).toBeTruthy();
    });

    it('должен обновлять календарь и показывать сообщение', () => {
        const testComponent = component as unknown as DatePickerComponentTestAccess;
        const genSpy = spyOn(testComponent, '_generateDaysInMonth');
        const setSpy = spyOn(testComponent, '_setStateOfDate');
        component.refreshDatePicker();
        expect(messageServiceSpy.add.calls.any()).toBeTruthy();
        expect(genSpy.calls.any()).toBeTruthy();
        expect(setSpy.calls.any()).toBeTruthy();
    });

    it('должен эмитить selectedDay при selectDay', () => {
        const day = { day: 1 } as CalendarResponse;
        const emitSpy = spyOn(component.selectedDay, 'emit');
        component.selectDay(day);
        expect(emitSpy.calls.any()).toBeTruthy();
        expect(emitSpy.calls.mostRecent().args[0]).toEqual(day);
    });
}); 