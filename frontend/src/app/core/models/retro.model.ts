/* ===== Team ===== */
export interface Team {
  id: string;
  name: string;
  createdAt: string;
  memberCount: number;
}

export interface CreateTeamRequest {
  name: string;
}

/* ===== Retro Session ===== */
export interface RetroSession {
  id: string;
  teamId: string;
  roomCode: string;
  status: RetroPhase;
  createdAt: string;
  closedAt?: string;
}

export type RetroPhase = 'COLLECT' | 'VOTE' | 'ACTION' | 'SUMMARY';

export interface CreateRetroRequest {
  teamId: string;
}

/* ===== Retro Item ===== */
export interface RetroItem {
  id: string;
  retroId: string;
  content: string;
  category: ItemCategory;
  voteCount: number;
  authorName: string;
  createdAt: string;
  promoted: boolean;
}

export type ItemCategory = 'WENT_WELL' | 'IMPROVE' | 'ACTION';

export interface CreateItemRequest {
  retroId: string;
  content: string;
  authorName: string;
}

/* ===== AI Preview ===== */
export interface PreviewResponse {
  suggestedCategory: ItemCategory;
  confidence: number;
  dejaVuWarning?: DejaVuWarning;
}

export interface DejaVuWarning {
  similarItemContent: string;
  similarityScore: number;
  fromRetroDate: string;
}

/* ===== Action Item ===== */
export interface ActionItem {
  id: string;
  retroItemId: string;
  assignee: string;
  deadline: string;
  successCriteria: string;
  smartSuggestion?: string;
}

export interface PromoteToActionRequest {
  retroItemId: string;
  assignee: string;
  deadline: string;
  successCriteria: string;
}

/* ===== Summary ===== */
export interface RetroSummary {
  summary: string;
  recurringThemes: string[];
  teamMorale: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  totalItems: number;
  totalVotes: number;
  actionItemCount: number;
}

/* ===== SMART Coach ===== */
export interface SmartCoachResponse {
  suggestion: string;
  assigneeSuggestion: string;
  deadlineSuggestion: string;
  criteriaSuggestion: string;
}
