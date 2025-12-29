import { Component, OnInit, ViewChild } from '@angular/core';
import { routes } from '../../../../consts';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ProductService } from '../../services';
import { Observable } from 'rxjs';
import { ProductDetails } from '../../models/product-details';
import { switchMap, take } from 'rxjs/operators';
import { DeletePopupComponent } from '../../../../shared/popups/delete-popup/delete-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-management-page',
  templateUrl: './management-page.component.html',
  styleUrls: ['./management-page.component.scss']
})
export class ManagementPageComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  public routes: typeof routes = routes;
  public products$: Observable<ProductDetails[]>;
  public displayedColumns: string[] = ['select', 'id', 'image', 'title', 'subtitle', 'price', 'status', 'discounts', 'actions'];
  public desktopColumns = this.displayedColumns;
  public mobileColumns = ['mobileView'];
  public dataSource: MatTableDataSource<ProductDetails>;
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
  checkboxLabel(row?: ProductDetails): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  constructor(
    private router: Router,
    private service: ProductService,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) {
    this.products$ = this.service.getProducts();

    this.products$.pipe(
      take(1)
    ).subscribe((products: ProductDetails[]) => {
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
    this.service.deleteProduct(id).pipe(
      switchMap((response: any) => {

        const message = response && response.message ? String(response.message) : 'محصول با موفقیت حذف شد';
        this.toastr.success(message);
        return this.service.getProducts();
      }),
      take(1)
    ).subscribe({
      next: (products) => {
        this.dataSource = new MatTableDataSource(products);
      },
      error: (err) => {
        this.toastr.error(err?.message || 'خطا در حذف محصول');
      }
    });
  }





  public getFirstImage(images: any): string {
    return images?.[0]?.url || '';
  }


  goToCreateDiscount(product: any) {
    this.router.navigate(['/discount/create', product.id], {
      state: { product }
    });
  }

  goToUpdateDiscount(product: any) {
    this.router.navigate(['/discount/edit', product.id], {
      state: { product }
    });
  }


  removeDiscount(product: any) {
    // تایید + حذف تخفیف
    console.log('remove discount for', product);
  }


}
