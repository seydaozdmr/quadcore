import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { ItemCategory } from '../../core/models/retro.model';

@Component({
  selector: 'app-category-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span class="badge" [ngClass]="badgeClass">{{ label }}</span>
  `,
})
export class CategoryBadgeComponent {
  @Input({ required: true }) category!: ItemCategory;

  get label(): string {
    const labels: Record<string, string> = {
      WENT_WELL: 'Iyi Gitti',
      IMPROVE: 'Iyilestir',
      ACTION: 'Eylem',
    };
    return labels[this.category] ?? this.category;
  }

  get badgeClass(): string {
    const classes: Record<string, string> = {
      WENT_WELL: 'badge-went-well',
      IMPROVE: 'badge-improve',
      ACTION: 'badge-action',
    };
    return classes[this.category] ?? '';
  }
}
