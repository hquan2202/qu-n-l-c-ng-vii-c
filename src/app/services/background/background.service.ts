import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackgroundService {

  constructor() {}

  // 🔹 Lưu background (màu hoặc hình ảnh) theo id bảng
  saveBackground(boardId: string, background: string): void {
    localStorage.setItem(`board_${boardId}_background`, background);
  }

  // 🔹 Lấy background đã lưu
  getBackground(boardId: string): string | null {
    return localStorage.getItem(`board_${boardId}_background`);
  }

  // 🔹 Xóa background của board
  clearBackground(boardId: string): void {
    localStorage.removeItem(`board_${boardId}_background`);
  }

  // 🔹 Lấy danh sách tất cả background đã lưu
  getAllBackgrounds(): { boardId: string, background: string }[] {
    const result: { boardId: string, background: string }[] = [];
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('board_') && key.endsWith('_background')) {
        result.push({
          boardId: key.split('_')[1],
          background: localStorage.getItem(key) || ''
        });
      }
    });
    return result;
  }
}
