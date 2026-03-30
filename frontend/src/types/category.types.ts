// src/types/category.types.ts
import { Category } from '../services/api';

export interface CategoryItem {
  emoji: string;
  name: string;
}

export type CategoryItems = Record<Category, CategoryItem[]>;

export interface DailyPreviewItem extends CategoryItem {
  day: string;
}

export interface WeeklyPreviewItem extends CategoryItem {
  week: number;
}