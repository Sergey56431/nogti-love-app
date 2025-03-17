import { ScheduleEditComponent } from '@views/page';
import { MessageService } from 'primeng/api';
import { CalendarService } from '@shared/services';
import { AuthService } from '@core/auth';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { DayState } from '@shared/utils';

describe('ScheduleEditComponent', () => {
  let component: ScheduleEditComponent;
  let authService: AuthService;
  let router: Router;
  let store: Store;
  let snackBar: MessageService;
  let calendarService: CalendarService;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['getUserInfo']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    store = jasmine.createSpyObj('Store', ['selectSignal']);
    snackBar = jasmine.createSpyObj('MessageService', ['add']);
    calendarService = jasmine.createSpyObj('CalendarService', ['createSchedule']);

    component = new ScheduleEditComponent(authService, router, store, snackBar, calendarService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize _userId and call _formingSchedule on ngOnInit', () => {
    (authService.getUserInfo as jasmine.Spy).and.returnValue({ userId: 'testUserId' });
    component.ngOnInit();
    expect(component._userId).toBe('testUserId');
    expect(component._formingSchedule).toHaveBeenCalled();
  });

  it('should recount minutes correctly', () => {
    component._adminSetting = () => ({ timeGranularity: '00:15' });
    component._recountMinute();
    expect(component._minute).toEqual(['0', '15', '30', '45']);
  });

  it('should set my work time correctly', () => {
    const day = { workTime: '09:00-18:00' };
    const result = component._setMyWorkTime(day);
    expect(result).toEqual(['09', '00', '18', '00']);
  });

  it('should check day state correctly', () => {
    component._schedule = () => ({ customDays: [{ date: '2022-01-01', state: DayState.WORKING }] });
    component._checkDayState('2022-01-01');
    expect(component._dayState).toBe(true);
  });

  it('should choose day correctly', () => {
    component._scheduleCustom = () => ({ customDays: [{ date: '2022-01-01', workTime: '09:00-18:00', state: DayState.WORKING }] });
    component._date = () => '2022-01-01';
    component._choiceDay();
    expect(component._mySchedule).toEqual({ date: '2022-01-01', workTime: '00:00-00:00', state: DayState.WORKING });
  });

  it('should change day info correctly', () => {
    component._schedule = () => ({ customDays: [{ date: '2022-01-01', workTime: '09:00-18:00', state: DayState.WORKING }] });
    component._mySchedule = { date: '2022-01-01', workTime: '00:00-00:00', state: DayState.WORKING };
    component._changeDayInfo();
    expect(component._schedule().customDays).toEqual([{ date: '2022-01-01', workTime: '00:00-00:00', state: DayState.WORKING }]);
  });

  it('should reset days correctly', () => {
    component._formingSchedule = jasmine.createSpy();
    component._resetDays();
    expect(component._formingSchedule).toHaveBeenCalled();
  });

  it('should form schedule correctly', () => {
    component._startDate = () => '2022-01-01';
    component._adminSetting = () => ({ defaultWorkTime: '09:00-18:00' });
    component._formingSchedule();
    expect(component._schedule().customDays.length).toBe(31);
    expect(component._schedule().customDays[0]).toEqual({ date: '2022-01-01', workTime: '09:00-18:00', state: DayState.WORKING });
  });

  it('should create schedule correctly', () => {
    (calendarService.createSchedule as jasmine.Spy).and.returnValue(of({ error: undefined }));
    component._scheduleCustom = () => ({ customDays: [{ date: '2022-01-01', workTime: '09:00-18:00', state: DayState.WORKING }] });
    component._createSchedule();
    expect(snackBar.add).toHaveBeenCalledWith({ severity: 'success', summary: 'Расписание успешно выставлено' });
    expect(router.navigate).toHaveBeenCalledWith(['/schedule']);
  });

  it('should handle error when creating schedule', () => {
    (calendarService.createSchedule as jasmine.Spy).and.returnValue(of({ error: 'testError' }));
    component._createSchedule();
    expect(snackBar.add).toHaveBeenCalledWith({ severity: 'error', summary: 'Ошибка при выставлении расписания' });
  });
});
