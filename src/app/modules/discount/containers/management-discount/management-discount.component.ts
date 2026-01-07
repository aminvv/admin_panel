import { Component, OnInit, ViewChild } from '@angular/core';
import { routes } from '../../../../consts';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { DiscountService } from '../../services';
import { Observable } from 'rxjs';
import { DiscountDetails } from '../../models/discount-details';
import { switchMap, take } from 'rxjs/operators';
import { DeletePopupComponent } from '../../../../shared/popups/delete-popup/delete-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-management-order',
  templateUrl: './management-discount.component.html',
  styleUrls: ['./management-discount.component.scss']
})
export class ManagementDiscountComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  public routes: typeof routes = routes;
  public Discounts$: Observable<DiscountDetails[]>;
  public displayedColumns: string[] = ['id', 'thumbnail',  'title','description',  'slug', 'category', 'status','actions'];
  public dataSource: MatTableDataSource<DiscountDetails>;
  deleteConfirmSubscription;
  selectedId: number;

  selection = new SelectionModel<any>(true, []);

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: DiscountDetails): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  constructor(private service: DiscountService,
    private toastr: ToastrService,
    public dialog: MatDialog) {
    this.Discounts$ = this.service.getDiscounts();

    this.Discounts$.pipe(
      take(1)
    ).subscribe((products: DiscountDetails[]) => {
      this.dataSource = new MatTableDataSource(products);
    });
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  openDeleteModal(id: number): void {
    this.selectedId = id;
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      width: '512px'
    });

    this.deleteConfirmSubscription = dialogRef.componentInstance.deleteConfirmed.subscribe(result => {
      this.delete(this.selectedId);
    });
  }



  public delete(id: number) {
    this.service.deleteDiscount(id).pipe(
      switchMap((response: any) => {

        const message = response && response.message? String(response.message): 'وبلاگ با موفقیت حذف شد';
        this.toastr.success(message);
        return this.service.getDiscounts();
      }),
      take(1)
    ).subscribe({
      next: (products) => {
        this.dataSource = new MatTableDataSource(products);
      },
      error: (err) => {
        this.toastr.error(err?.message || 'خطا در حذف وبلاگ');
      }
    });
  }


public getFirstImage(thumbnail: any): string {
  if (!thumbnail) return '';

  if (Array.isArray(thumbnail) && typeof thumbnail[0] === 'string') {
    return thumbnail[0];
  }

  if (Array.isArray(thumbnail) && thumbnail[0]?.url) {
    return thumbnail[0].url;
  }

  return '';
}


}
