// src/app/modules/admin/orders/components/order-status-flow.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { OrderService, OrderStatusFlow } from '../../services/order.service';

@Component({
  selector: 'app-order-status-flow',
  templateUrl: './order-status-flow.component.html',
  styleUrls: ['./order-status-flow.component.scss']
})
export class OrderStatusFlowComponent implements OnInit {
  @Input() orderId!: number;
  @Input() currentStatus!: string;
  @Input() canEdit: boolean = true;
  @Output() statusChanged = new EventEmitter<string>();

  flow: OrderStatusFlow[] = [];
  nextPossibleStatuses: OrderStatusFlow[] = [];
  selectedNewStatus: string = '';
  changeReason: string = '';

  showChangeModal: boolean = false;
  loading: boolean = false;

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.loadStatusFlow();
  }

  // ======== Getter Methods ========
  get statusLabel(): string {
    return this.orderService.getStatusLabel(this.currentStatus);
  }

  get statusColor(): string {
    return this.orderService.getStatusColor(this.currentStatus);
  }

  get statusIcon(): string {
    return this.orderService.getStatusIcon(this.currentStatus);
  }

  get statusDescription(): string {
    const statusInfo = this.flow.find(item => item.status === this.currentStatus);
    return statusInfo?.description || 'توضیحی موجود نیست';
  }

  // ======== Main Methods ========
  loadStatusFlow(): void {
    this.flow = this.orderService.getOrderStatusFlow(this.currentStatus);
    this.nextPossibleStatuses = this.orderService.getNextPossibleStatuses(this.currentStatus);
  }

  openChangeModal(): void {
    this.showChangeModal = true;
    this.selectedNewStatus = '';
  }

  closeChangeModal(): void {
    this.showChangeModal = false;
    this.selectedNewStatus = '';
  }

  changeStatus(): void {
    if (!this.selectedNewStatus) {
      alert('لطفاً وضعیت جدید را انتخاب کنید');
      return;
    }

    if (!this.orderService.canChangeStatus(this.currentStatus, this.selectedNewStatus)) {
      alert('این تغییر وضعیت مجاز نیست');
      return;
    }

    const confirmMessage = this.selectedNewStatus === 'canceled'
      ? 'آیا از لغو این سفارش اطمینان دارید؟ این عمل قابل بازگشت نیست.'
      : `آیا از تغییر وضعیت از "${this.statusLabel}" به "${this.orderService.getStatusLabel(this.selectedNewStatus)}" اطمینان دارید؟`;

    if (confirm(confirmMessage)) {
      this.loading = true;

      const apiMethod = this.selectedNewStatus === 'canceled'
        ? this.orderService.cancelOrder(this.orderId)
        : this.orderService.advanceStatus(this.orderId);

      apiMethod.subscribe({
        next: () => {
          this.statusChanged.emit(this.selectedNewStatus);
          this.closeChangeModal();
          this.loading = false;
          this.loadStatusFlow();
        },
        error: (err) => {
          alert('خطا در تغییر وضعیت: ' + (err.error?.message || 'لطفاً دوباره تلاش کنید'));
          this.loading = false;
        }
      });
    }
  }




  getStatusIcon(status: string): string {
    const option = this.nextPossibleStatuses.find(item => item.status === status);
    return option?.icon || 'help_outline';
  }

  getStatusLabel(status: string): string {
    const option = this.nextPossibleStatuses.find(item => item.status === status);
    return option?.label || status;
  }

  revertStatus(): void {
    if (!this.canRevert) return;

    if (confirm('آیا از بازگشت به مرحله قبل اطمینان دارید؟')) {
      this.loading = true;
      this.orderService.revertStatus(this.orderId).subscribe({
        next: () => {
          this.statusChanged.emit();
          this.loading = false;
          this.loadStatusFlow();
        },
        error: (err) => {
          alert('خطا در بازگشت وضعیت: ' + (err.error?.message || 'لطفاً دوباره تلاش کنید'));
          this.loading = false;
        }
      });
    }
  }

  quickAdvance(): void {
    const suggestedStatus = this.suggestedNextStatus;
    if (suggestedStatus) {
      this.selectedNewStatus = suggestedStatus.status;
      this.changeStatus();
    }
  }

  // ======== Helper Properties ========
  get canRevert(): boolean {
    return this.orderService.canRevert(this.currentStatus);
  }

  get suggestedNextStatus(): OrderStatusFlow | null {
    if (this.nextPossibleStatuses.length === 0) return null;

    const nonCancelStatus = this.nextPossibleStatuses.find(s => s.status !== 'canceled');
    return nonCancelStatus || this.nextPossibleStatuses[0];
  }

  get isCancelled(): boolean {
    return this.currentStatus === 'canceled';
  }

  get isDelivered(): boolean {
    return this.currentStatus === 'delivered';
  }
}