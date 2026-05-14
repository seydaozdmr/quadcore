import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgFor, NgIf, NgClass, NgSwitch, NgSwitchCase } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap, of } from 'rxjs';
import { RetroService } from '../../core/services/retro.service';
import {
  RetroSession,
  RetroItem,
  RetroPhase,
  ItemCategory,
  PreviewResponse,
  ActionItem,
  RetroSummary,
  SmartCoachResponse,
} from '../../core/models/retro.model';

@Component({
  selector: 'app-retro-room',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    NgIf,
    NgClass,
    NgSwitch,
    NgSwitchCase,
  ],
  template: `
    <div class="retro-room">
      <!-- Room Header -->
      <header class="room-header">
        <div class="room-info">
          <h1 class="room-code">{{ roomCode }}</h1>
          <span class="phase-indicator" [ngClass]="'phase-' + currentPhase().toLowerCase()">
            {{ getPhaseLabel(currentPhase()) }}
          </span>
        </div>
        <div class="room-actions">
          <div class="phase-steps">
            <span
              *ngFor="let phase of phases; let i = index"
              class="step"
              [ngClass]="{
                active: phase === currentPhase(),
                completed: getPhaseIndex(currentPhase()) > i
              }"
            >
              {{ i + 1 }}
            </span>
          </div>
          <button
            *ngIf="currentPhase() !== 'SUMMARY'"
            class="btn btn-primary btn-sm"
            (click)="advancePhase()"
          >
            Faz Ilerlet &rarr;
          </button>
        </div>
      </header>

      <!-- Phase Content -->
      <div [ngSwitch]="currentPhase()">
        <!-- PHASE 1: COLLECT -->
        <section *ngSwitchCase="'COLLECT'" class="phase-content fade-in">
          <div class="collect-layout">
            <!-- Input Area -->
            <div class="card collect-input-card">
              <h2 class="section-title">Yeni Madde Ekle</h2>
              <div class="input-group">
                <input
                  class="input author-input"
                  [(ngModel)]="authorName"
                  placeholder="Adınız"
                />
                <textarea
                  class="input item-textarea"
                  [(ngModel)]="itemContent"
                  placeholder="Retro maddenizi yazın..."
                  (input)="onContentInput($event)"
                  rows="3"
                ></textarea>
              </div>

              <!-- AI Preview -->
              <div *ngIf="preview()" class="ai-preview fade-in">
                <div class="preview-header">
                  <span class="preview-label">AI Tahmini:</span>
                  <span
                    class="badge"
                    [ngClass]="getCategoryBadgeClass(preview()!.suggestedCategory)"
                  >
                    {{ getCategoryLabel(preview()!.suggestedCategory) }}
                  </span>
                  <span class="confidence">
                    %{{ (preview()!.confidence * 100).toFixed(0) }}
                  </span>
                </div>
                <div *ngIf="preview()!.dejaVuWarning" class="deja-vu-warning fade-in">
                  <span class="warning-icon">&#9888;</span>
                  <div>
                    <strong>Deja Vu!</strong> Bu madde daha onceki bir retrospektifle benzerlik tasiyor:
                    <em>"{{ preview()!.dejaVuWarning!.similarItemContent }}"</em>
                    <span class="similarity">
                      ({{ preview()!.dejaVuWarning!.fromRetroDate }} - %{{ (preview()!.dejaVuWarning!.similarityScore * 100).toFixed(0) }} benzerlik)
                    </span>
                  </div>
                </div>
              </div>

              <div *ngIf="previewLoading()" class="preview-loading pulse">
                AI analiz ediyor...
              </div>

              <button
                class="btn btn-primary submit-btn"
                [disabled]="!itemContent().trim() || !authorName().trim()"
                (click)="submitItem()"
              >
                Gonder
              </button>
            </div>

            <!-- Items List -->
            <div class="items-panel">
              <h2 class="section-title">Maddeler ({{ items().length }})</h2>
              <div *ngIf="items().length === 0" class="empty-state">
                <p>Henuz madde eklenmedi.</p>
              </div>
              <div class="items-list">
                <div
                  *ngFor="let item of items()"
                  class="card item-card fade-in"
                  [ngClass]="'category-' + item.category.toLowerCase()"
                >
                  <div class="item-header">
                    <span
                      class="badge"
                      [ngClass]="getCategoryBadgeClass(item.category)"
                    >
                      {{ getCategoryLabel(item.category) }}
                    </span>
                    <span class="item-author">{{ item.authorName }}</span>
                  </div>
                  <p class="item-content">{{ item.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- PHASE 2: VOTE -->
        <section *ngSwitchCase="'VOTE'" class="phase-content fade-in">
          <h2 class="section-title">Oy Ver</h2>
          <div class="vote-columns">
            <div *ngFor="let cat of categories" class="vote-column">
              <h3 class="column-title" [ngClass]="'color-' + cat.key.toLowerCase()">
                {{ cat.label }}
              </h3>
              <div class="items-list">
                <div
                  *ngFor="let item of getItemsByCategory(cat.key)"
                  class="card item-card fade-in"
                >
                  <p class="item-content">{{ item.content }}</p>
                  <div class="item-footer">
                    <span class="item-author">{{ item.authorName }}</span>
                    <button class="btn btn-secondary btn-sm vote-btn" (click)="voteItem(item.id)">
                      &#9650; Oy Ver
                      <span class="vote-count">{{ item.voteCount }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- PHASE 3: ACTION -->
        <section *ngSwitchCase="'ACTION'" class="phase-content fade-in">
          <h2 class="section-title">Aksiyona Cevir</h2>
          <div class="action-layout">
            <div class="items-ranked">
              <div
                *ngFor="let item of sortedByVotes(); let i = index"
                class="card item-card action-item-card fade-in"
                [ngClass]="{ 'top-item': i < 3, promoted: item.promoted }"
              >
                <div class="item-header">
                  <span class="rank">#{{ i + 1 }}</span>
                  <span
                    class="badge"
                    [ngClass]="getCategoryBadgeClass(item.category)"
                  >
                    {{ getCategoryLabel(item.category) }}
                  </span>
                  <span class="vote-display">&#9650; {{ item.voteCount }}</span>
                </div>
                <p class="item-content">{{ item.content }}</p>
                <div class="item-footer">
                  <span class="item-author">{{ item.authorName }}</span>
                  <button
                    *ngIf="!item.promoted && i < 5"
                    class="btn btn-primary btn-sm"
                    (click)="requestSmartCoach(item.id)"
                  >
                    Aksiyona Cevir
                  </button>
                  <span *ngIf="item.promoted" class="promoted-label">&#10003; Aksiyon olarak atandi</span>
                </div>

                <!-- SMART Coach Form -->
                <div
                  *ngIf="activeCoachItemId() === item.id"
                  class="smart-coach-form card fade-in"
                >
                  <div *ngIf="coachLoading()" class="pulse">SMART Coach dusunuyor...</div>
                  <div *ngIf="smartCoach()">
                    <div class="coach-suggestion">
                      <strong>AI Onerisi:</strong>
                      <p>{{ smartCoach()!.suggestion }}</p>
                    </div>
                    <form [formGroup]="actionForm" (ngSubmit)="submitAction(item.id)">
                      <div class="form-field">
                        <label>Sorumlu</label>
                        <input class="input" formControlName="assignee"
                          [placeholder]="smartCoach()!.assigneeSuggestion" />
                      </div>
                      <div class="form-field">
                        <label>Son Tarih</label>
                        <input class="input" type="date" formControlName="deadline" />
                      </div>
                      <div class="form-field">
                        <label>Basari Kriteri</label>
                        <textarea class="input" formControlName="successCriteria"
                          [placeholder]="smartCoach()!.criteriaSuggestion"
                          rows="2"></textarea>
                      </div>
                      <button
                        class="btn btn-primary"
                        type="submit"
                        [disabled]="actionForm.invalid"
                      >
                        Aksiyonu Kaydet
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- PHASE 4: SUMMARY -->
        <section *ngSwitchCase="'SUMMARY'" class="phase-content fade-in">
          <div *ngIf="summaryLoading()" class="empty-state">
            <p class="pulse">Retro ozeti hazirlaniyor...</p>
          </div>

          <div *ngIf="summary()" class="summary-layout">
            <div class="card summary-card">
              <h2 class="section-title">Retro Ozeti</h2>
              <p class="summary-text">{{ summary()!.summary }}</p>
            </div>

            <div class="summary-stats">
              <div class="card stat-card">
                <span class="stat-value">{{ summary()!.totalItems }}</span>
                <span class="stat-label">Toplam Madde</span>
              </div>
              <div class="card stat-card">
                <span class="stat-value">{{ summary()!.totalVotes }}</span>
                <span class="stat-label">Toplam Oy</span>
              </div>
              <div class="card stat-card">
                <span class="stat-value">{{ summary()!.actionItemCount }}</span>
                <span class="stat-label">Aksiyon</span>
              </div>
              <div class="card stat-card">
                <span class="stat-value morale" [ngClass]="'morale-' + summary()!.teamMorale.toLowerCase()">
                  {{ getMoraleLabel(summary()!.teamMorale) }}
                </span>
                <span class="stat-label">Takim Morali</span>
              </div>
            </div>

            <div *ngIf="summary()!.recurringThemes.length > 0" class="card themes-card">
              <h3 class="section-title">Tekrarlayan Temalar</h3>
              <div class="themes-list">
                <span *ngFor="let theme of summary()!.recurringThemes" class="theme-tag">
                  {{ theme }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .retro-room {
      max-width: 1100px;
      margin: 0 auto;
    }

    /* ===== Header ===== */
    .room-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .room-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .room-code {
      font-family: monospace;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent);
    }

    .phase-indicator {
      padding: 4px 14px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .phase-collect { background: var(--accent-light); color: var(--accent); }
    .phase-vote { background: var(--improve-bg); color: var(--improve); }
    .phase-action { background: var(--action-bg); color: var(--action); }
    .phase-summary { background: var(--went-well-bg); color: var(--went-well); }

    .room-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .phase-steps {
      display: flex;
      gap: 8px;
    }

    .step {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      background: var(--bg-hover);
      color: var(--text-muted);
      border: 2px solid var(--border-color);
      transition: all 0.2s;

      &.active {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }

      &.completed {
        background: var(--went-well);
        color: #fff;
        border-color: var(--went-well);
      }
    }

    /* ===== COLLECT Phase ===== */
    .collect-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .collect-input-card {
      position: sticky;
      top: 80px;
      align-self: start;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 12px;
    }

    .author-input {
      max-width: 200px;
    }

    .item-textarea {
      min-height: 80px;
    }

    .ai-preview {
      margin: 12px 0;
      padding: 12px;
      background: var(--bg-primary);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
    }

    .preview-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .preview-label {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .confidence {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .preview-loading {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 8px 0;
    }

    .deja-vu-warning {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      padding: 10px;
      background: var(--improve-bg);
      border: 1px solid var(--improve-border);
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      color: var(--improve);

      .warning-icon {
        font-size: 1.2rem;
        flex-shrink: 0;
      }

      em {
        display: block;
        margin-top: 4px;
        color: var(--text-primary);
      }

      .similarity {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }

    .submit-btn {
      width: 100%;
      margin-top: 8px;
    }

    /* ===== Items ===== */
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .item-card {
      border-left: 3px solid var(--border-color);

      &.category-went_well { border-left-color: var(--went-well); }
      &.category-improve { border-left-color: var(--improve); }
      &.category-action { border-left-color: var(--action); }
    }

    .item-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .item-content {
      font-size: 0.95rem;
      line-height: 1.5;
      color: var(--text-primary);
    }

    .item-author {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
    }

    /* ===== VOTE Phase ===== */
    .vote-columns {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .column-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid;

      &.color-went_well { border-color: var(--went-well); color: var(--went-well); }
      &.color-improve { border-color: var(--improve); color: var(--improve); }
      &.color-action { border-color: var(--action); color: var(--action); }
    }

    .vote-btn {
      gap: 6px;
    }

    .vote-count {
      font-weight: 700;
      color: var(--accent);
    }

    /* ===== ACTION Phase ===== */
    .action-layout {
      max-width: 700px;
    }

    .action-item-card {
      &.top-item {
        border-left-width: 4px;
      }

      &.promoted {
        opacity: 0.7;
      }
    }

    .rank {
      font-weight: 700;
      color: var(--accent);
      font-size: 1rem;
    }

    .vote-display {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-left: auto;
    }

    .promoted-label {
      color: var(--went-well);
      font-size: 0.8rem;
      font-weight: 600;
    }

    .smart-coach-form {
      margin-top: 16px;
      padding: 16px;
      background: var(--bg-primary);
      border: 1px solid var(--accent);
    }

    .coach-suggestion {
      margin-bottom: 16px;
      padding: 10px;
      background: var(--accent-light);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;

      p {
        margin-top: 4px;
        color: var(--text-primary);
      }
    }

    .form-field {
      margin-bottom: 12px;

      label {
        display: block;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: 4px;
      }
    }

    /* ===== SUMMARY Phase ===== */
    .summary-layout {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .summary-card {
      .summary-text {
        font-size: 1rem;
        line-height: 1.7;
        color: var(--text-primary);
      }
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;

      @media (max-width: 600px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .stat-card {
      text-align: center;
      padding: 20px;
    }

    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent);
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .morale-positive { color: var(--went-well) !important; }
    .morale-neutral { color: var(--improve) !important; }
    .morale-negative { color: #ef4444 !important; }

    .themes-card {
      .themes-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }

    .theme-tag {
      padding: 6px 14px;
      background: var(--accent-light);
      color: var(--accent);
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 500;
    }
  `],
})
export class RetroRoomComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly retroService = inject(RetroService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();
  private readonly contentInput$ = new Subject<string>();

  roomCode = '';
  readonly phases: RetroPhase[] = ['COLLECT', 'VOTE', 'ACTION', 'SUMMARY'];
  readonly categories = [
    { key: 'WENT_WELL' as ItemCategory, label: 'Iyi Gitti' },
    { key: 'IMPROVE' as ItemCategory, label: 'Iyilestir' },
    { key: 'ACTION' as ItemCategory, label: 'Eylem' },
  ];

  /* State signals */
  readonly session = signal<RetroSession | null>(null);
  readonly currentPhase = signal<RetroPhase>('COLLECT');
  readonly items = signal<RetroItem[]>([]);
  readonly preview = signal<PreviewResponse | null>(null);
  readonly previewLoading = signal(false);
  readonly summary = signal<RetroSummary | null>(null);
  readonly summaryLoading = signal(false);
  readonly smartCoach = signal<SmartCoachResponse | null>(null);
  readonly coachLoading = signal(false);
  readonly activeCoachItemId = signal<string | null>(null);

  /* Form signals */
  readonly itemContent = signal('');
  readonly authorName = signal('');

  /* Computed */
  readonly sortedByVotes = computed(() =>
    [...this.items()].sort((a, b) => b.voteCount - a.voteCount)
  );

  /* Action form */
  readonly actionForm = this.fb.group({
    assignee: ['', Validators.required],
    deadline: ['', Validators.required],
    successCriteria: ['', Validators.required],
  });

  ngOnInit(): void {
    this.roomCode = this.route.snapshot.paramMap.get('roomCode') ?? '';

    // Load session
    this.retroService.getByRoomCode(this.roomCode).subscribe({
      next: (session) => {
        this.session.set(session);
        this.currentPhase.set(session.status);
        this.loadItems(session.id);
        if (session.status === 'SUMMARY') {
          this.loadSummary(session.id);
        }
      },
    });

    // Debounced preview
    this.contentInput$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((content) => {
          if (!content.trim() || !this.session()) {
            this.preview.set(null);
            return of(null);
          }
          this.previewLoading.set(true);
          return this.retroService.previewItem(this.session()!.id, content);
        })
      )
      .subscribe({
        next: (result) => {
          if (result) this.preview.set(result);
          this.previewLoading.set(false);
        },
        error: () => this.previewLoading.set(false),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ---- Data Loading ---- */

  private loadItems(retroId: string): void {
    this.retroService.getItems(retroId).subscribe({
      next: (items) => this.items.set(items),
    });
  }

  private loadSummary(retroId: string): void {
    this.summaryLoading.set(true);
    this.retroService.getSummary(retroId).subscribe({
      next: (s) => {
        this.summary.set(s);
        this.summaryLoading.set(false);
      },
      error: () => this.summaryLoading.set(false),
    });
  }

  /* ---- Event Handlers ---- */

  onContentInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.itemContent.set(value);
    this.contentInput$.next(value);
  }

  submitItem(): void {
    const session = this.session();
    if (!session) return;

    this.retroService
      .createItem({
        retroId: session.id,
        content: this.itemContent(),
        authorName: this.authorName(),
      })
      .subscribe({
        next: (item) => {
          this.items.update((list) => [...list, item]);
          this.itemContent.set('');
          this.preview.set(null);
        },
      });
  }

  voteItem(itemId: string): void {
    const session = this.session();
    if (!session) return;

    this.retroService.vote(session.id, itemId).subscribe({
      next: (updated) => {
        this.items.update((list) =>
          list.map((item) => (item.id === updated.id ? updated : item))
        );
      },
    });
  }

  advancePhase(): void {
    const session = this.session();
    if (!session) return;

    this.retroService.advancePhase(session.id).subscribe({
      next: (updated) => {
        this.session.set(updated);
        this.currentPhase.set(updated.status);
        if (updated.status === 'SUMMARY') {
          this.loadSummary(updated.id);
        }
      },
    });
  }

  requestSmartCoach(itemId: string): void {
    this.activeCoachItemId.set(itemId);
    this.smartCoach.set(null);
    this.coachLoading.set(true);

    this.retroService.getSmartCoach(itemId).subscribe({
      next: (coach) => {
        this.smartCoach.set(coach);
        this.coachLoading.set(false);
        this.actionForm.patchValue({
          assignee: coach.assigneeSuggestion,
          deadline: coach.deadlineSuggestion,
          successCriteria: coach.criteriaSuggestion,
        });
      },
      error: () => this.coachLoading.set(false),
    });
  }

  submitAction(retroItemId: string): void {
    if (this.actionForm.invalid) return;
    const val = this.actionForm.value;

    this.retroService
      .promoteToAction({
        retroItemId,
        assignee: val.assignee!,
        deadline: val.deadline!,
        successCriteria: val.successCriteria!,
      })
      .subscribe({
        next: () => {
          this.items.update((list) =>
            list.map((item) =>
              item.id === retroItemId ? { ...item, promoted: true } : item
            )
          );
          this.activeCoachItemId.set(null);
          this.smartCoach.set(null);
          this.actionForm.reset();
        },
      });
  }

  /* ---- Helpers ---- */

  getItemsByCategory(category: ItemCategory): RetroItem[] {
    return this.items().filter((item) => item.category === category);
  }

  getPhaseIndex(phase: RetroPhase): number {
    return this.phases.indexOf(phase);
  }

  getPhaseLabel(phase: string): string {
    const labels: Record<string, string> = {
      COLLECT: 'Toplama',
      VOTE: 'Oylama',
      ACTION: 'Aksiyon',
      SUMMARY: 'Ozet',
    };
    return labels[phase] ?? phase;
  }

  getCategoryLabel(category: ItemCategory): string {
    const labels: Record<string, string> = {
      WENT_WELL: 'Iyi Gitti',
      IMPROVE: 'Iyilestir',
      ACTION: 'Eylem',
    };
    return labels[category] ?? category;
  }

  getCategoryBadgeClass(category: ItemCategory): string {
    const classes: Record<string, string> = {
      WENT_WELL: 'badge-went-well',
      IMPROVE: 'badge-improve',
      ACTION: 'badge-action',
    };
    return classes[category] ?? '';
  }

  getMoraleLabel(morale: string): string {
    const labels: Record<string, string> = {
      POSITIVE: 'Pozitif',
      NEUTRAL: 'Notr',
      NEGATIVE: 'Negatif',
    };
    return labels[morale] ?? morale;
  }
}
