import {LiveAnnouncer} from '@angular/cdk/a11y';
import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatSort, Sort, MatSortHeader} from '@angular/material/sort';
import {
  MatCell, MatCellDef,
  MatColumnDef, MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef, MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import {MatPaginator} from "@angular/material/paginator";

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}
const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Елена', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Валентина', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Екатерина', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Александра', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Юлия', weight: 10.811, symbol: 'B'},
];
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
  styleUrl: './clients-page.component.scss'
})

export class ClientsPageComponent implements AfterViewInit{
  title = 'Клиенты';

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  constructor(private _liveAnnouncer: LiveAnnouncer) {}

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
