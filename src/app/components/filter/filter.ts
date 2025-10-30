// src/app/components/filter/filter.ts
import {
  Component,
  OnInit,
  ViewEncapsulation,
  DestroyRef,
  ElementRef,
  HostListener,
} from '@angular/core';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UiFilterService } from '../../services/ui-filter/ui-filter.service';

@Component({
  selector: 'app-filter',
  standalone: true,
  templateUrl: './filter.html',
  styleUrls: ['./filter.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [AsyncPipe, NgForOf, NgIf],
})
export class FilterComponent implements OnInit {
  availableStatuses: string[] = ['To Do', 'In Progress', 'Review', 'Done'];
  currentFilterStatus$: Observable<string | null>;
  currentStatus: string | null = null;

  constructor(
    public uiFilterService: UiFilterService,
    private destroyRef: DestroyRef,
    private elRef: ElementRef<HTMLElement>
  ) {
    this.currentFilterStatus$ =
      this.uiFilterService.currentFilterStatus$ as Observable<string | null>;
  }

  ngOnInit(): void {
    this.currentFilterStatus$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status: string | null) => (this.currentStatus = status));
  }

  // ✅ Chọn filter: KHÔNG đóng menu (không emit ra ngoài)
  handleFilter(status: string): void {
    const next: string | null = this.currentStatus === status ? null : status;
    this.uiFilterService.setFilter(next);
  }

  // ✅ Click ra ngoài: TỰ CLEAR filter
  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    const host = this.elRef.nativeElement;
    const target = ev.target as Node | null;
    if (target && !host.contains(target)) {
      // click ngoài component -> tắt filter đang bật
      this.uiFilterService.setFilter(null);
    }
  }
}
