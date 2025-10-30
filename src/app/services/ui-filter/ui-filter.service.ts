import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Định nghĩa kiểu dữ liệu cho việc ánh xạ màu sắc
export interface StatusColorMap {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class UiFilterService {
  // Trạng thái mặc định và ánh xạ màu
  private readonly DEFAULT_COLORS: StatusColorMap = {
    'To Do': '#dc3545',        // Đỏ
    'In Progress': '#ffc107',  // Vàng
    'Review': '#17a2b8',       // Xanh ngọc
    'Done': '#28a745',         // Xanh lá
    'default': '#6c757d'       // Màu xám
  };

  // Subject lưu trạng thái lọc hiện tại. Null = không lọc.
  private currentFilterStatusSource = new BehaviorSubject<string | null>(null);
  currentFilterStatus$: Observable<string | null> = this.currentFilterStatusSource.asObservable();

  // Biến lưu trữ màu sắc (có thể mở rộng sau này)
  statusColors: StatusColorMap = this.DEFAULT_COLORS;

  constructor() { }

  /**
   * Cập nhật trạng thái lọc. Nếu bấm lại vào trạng thái đang chọn, hủy lọc (set null).
   * @param status Trạng thái mới muốn lọc (hoặc null để hủy lọc).
   */
  setFilter(status: string | null): void {
    const currentStatus = this.currentFilterStatusSource.getValue();
    const newStatus = currentStatus === status ? null : status;
    this.currentFilterStatusSource.next(newStatus);
  }

  /**
   * Trả về mã màu tương ứng với trạng thái.
   * @param status Trạng thái thẻ.
   * @returns Mã màu HEX.
   */
  getColor(status: string): string {
    return this.statusColors[status] || this.statusColors['default'];
  }
}
