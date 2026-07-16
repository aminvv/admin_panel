import { Component, OnInit } from '@angular/core';
import { ProductSpotlightService } from '../product-spotlight.service';
import { ProductSpotlightDetails } from '../model/product-spotlight.model';

@Component({
  selector: 'app-product-spotlight-list',
  templateUrl: './product-spotlight-list.component.html',
  styleUrls: ['./product-spotlight-list.component.scss']
})
export class ProductSpotlightListComponent implements OnInit {
  spotlights: ProductSpotlightDetails[] = [];
  selectedSpotlight: ProductSpotlightDetails | null = null;
  loading = false;

  constructor(private spotlightService: ProductSpotlightService) {}

  ngOnInit(): void {
    this.fetchAll();
  }

  fetchAll(): void {
    this.loading = true;
    this.spotlightService.getAllAdmin().subscribe({
      next: (data) => {
        this.spotlights = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onEdit(item: ProductSpotlightDetails): void {
    this.selectedSpotlight = item;
  }

  onCreate(data: ProductSpotlightDetails): void {
    this.spotlightService.create(data).subscribe({
      next: () => {
        this.fetchAll();
        this.selectedSpotlight = null;
      },
      error: (err) => {
        console.log('❌ خطای سرور:', err.error);
      }
    });
  }

  onUpdate(data: ProductSpotlightDetails): void {
    this.spotlightService.update(data.id as number, data).subscribe({
      next: () => {
        this.fetchAll();
        this.selectedSpotlight = null;
      },
      error: (err) => {
        console.log('❌ خطای سرور:', err.error);
      }
    });
  }

  onDelete(id: number): void {
    if (!confirm('آیا از حذف این محصول ویژه مطمئن هستید؟')) return;
    this.spotlightService.remove(id).subscribe(() => this.fetchAll());
  }
}