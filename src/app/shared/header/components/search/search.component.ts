// search.component.ts
import { Component, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { GlobalSearchService, SearchResults } from './search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  public isShowInput = false;
  public query = '';
  public results: SearchResults = { products: [], orders: [], users: [] };
  public isLoading = false;
  public showDropdown = false;

  private queryChanged = new Subject<string>();

  constructor(
    private searchService: GlobalSearchService,
    private router: Router,
    private elementRef: ElementRef,
  ) {
    this.queryChanged
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          this.isLoading = true;
          return this.searchService.search(q);
        }),
      )
      .subscribe((res) => {
        this.results = res;
        this.isLoading = false;
        this.showDropdown = true;
      });
  }

  public showInput(): void {
    this.isShowInput = true;
  }

  public onInputChange(value: string): void {
    this.query = value;
    if (value.trim().length < 2) {
      this.showDropdown = false;
      return;
    }
    this.queryChanged.next(value);
  }

public goToProduct(id: number): void {
  this.router.navigate(['/e-commerce/product', id]);
  this.closeDropdown();
}

  public goToOrder(id: number): void {
    this.router.navigate(['/order/detail', id]);
    this.closeDropdown();
  }

public goToUser(id: number): void {
  this.router.navigate(['/user/list']);
  this.closeDropdown();
}
  private closeDropdown(): void {
    this.showDropdown = false;
    this.isShowInput = false;
    this.query = '';
  }

  // بستن دراپ‌داون وقتی بیرون از کامپوننت کلیک می‌شه
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }
}