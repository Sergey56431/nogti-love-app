import {LiveAnnouncer} from '@angular/cdk/a11y';
import {AfterViewInit, ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {MatSort, Sort, MatSortHeader} from '@angular/material/sort';
import {
  MatCell, MatCellDef,
  MatColumnDef, MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef, MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';

export interface PeriodicElement {
  name: string;
  position: number;
  score: number;
  phone: string;
  lastVisit: string;
  comment: string;
  options: [];
}

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [
    MatHeaderCell,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatSortHeader,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderRowDef,
    MatCellDef,
    MatPaginator
  ],
  templateUrl: './clients-page.component.html',
  styleUrl: './clients-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ClientsPageComponent implements AfterViewInit{
  title = 'Клиенты';

  protected readonly ELEMENT_DATA: PeriodicElement[] = [
    {position: 1, name: 'Елена', score: 250, phone: '8-995-515-76-93', lastVisit: '12.06.2024', comment: 'Елена цирк', options: [] },
    {position: 2, name: 'Алина', score: 150, phone: '8-999-544-11-23', lastVisit: '13.07.2024', comment: 'Алина магазин', options: [] },
    {position: 3, name: 'Клава', score: 0, phone: '8-900-534-73-22', lastVisit: '20.08.2024', comment: 'Клава брови', options: [] },
    {position: 4, name: 'Наталья', score: 128, phone: '8-933-333-33-43', lastVisit: '01.01.2024', comment: 'Наталья работа', options: [] },
    {position: 5, name: 'Александра', score: 35, phone: '8-901-522-66-33', lastVisit: '21.08.2024', comment: 'Александра автобус', options: [] },
    {position: 6, name: 'Валентина', score: 220, phone: '8-904-480-06-21', lastVisit: '12.06.2024', comment: 'Валентина спортзал', options: [] },
  ];

  displayedColumns: string[] = ['position', 'name', 'score', 'phone', 'lastVisit', 'comment', 'options'];
  dataSource = new MatTableDataSource(this.ELEMENT_DATA);

  constructor(private _liveAnnouncer: LiveAnnouncer) {}

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort; // Для сортировки в столбцах
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
