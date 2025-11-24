import { InjectionToken } from '@angular/core';
import { IBoardDataSource } from './IBoardDataSource';

export const BOARD_DATASOURCE = new InjectionToken<IBoardDataSource>('BOARD_DATASOURCE');
