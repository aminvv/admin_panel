import { Component, OnInit } from '@angular/core';
import { SlideService } from '../slide.service';
import { SlideDetails } from '../model/slide.model';

@Component({
  selector: 'app-slide-list',
  templateUrl: './slide-list.component.html',
  styleUrls: ['./slide-list.component.scss']
})
export class SlideListComponent implements OnInit {
  slides: SlideDetails[] = [];
  selectedSlide: SlideDetails | null = null;
  loading = false;

  constructor(private slideService: SlideService) {}

  ngOnInit(): void {
    this.fetchAll();
  }

  fetchAll(): void {
    this.loading = true;
    this.slideService.getAllAdmin().subscribe({
      next: (data) => { this.slides = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onEdit(item: SlideDetails): void {
    this.selectedSlide = item;
  }

  onCreate(data: SlideDetails): void {
    this.slideService.create(data).subscribe({
      next: () => { this.fetchAll(); this.selectedSlide = null; },
      error: (err) => console.log('❌ خطای سرور:', err.error)
    });
  }

  onUpdate(data: SlideDetails): void {
    this.slideService.update(data.id as number, data).subscribe({
      next: () => { this.fetchAll(); this.selectedSlide = null; },
      error: (err) => console.log('❌ خطای سرور:', err.error)
    });
  }

  onDelete(id: number): void {
    if (!confirm('آیا از حذف این اسلاید مطمئن هستید؟')) return;
    this.slideService.remove(id).subscribe(() => this.fetchAll());
  }
}