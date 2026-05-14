import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RetroSession,
  CreateRetroRequest,
  RetroItem,
  CreateItemRequest,
  PreviewResponse,
  ActionItem,
  PromoteToActionRequest,
  RetroSummary,
  SmartCoachResponse,
} from '../models/retro.model';

@Injectable({ providedIn: 'root' })
export class RetroService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/retros';

  /* ---- Session ---- */

  getByTeamId(teamId: string): Observable<RetroSession[]> {
    return this.http.get<RetroSession[]>(`${this.baseUrl}?teamId=${teamId}`);
  }

  getByRoomCode(roomCode: string): Observable<RetroSession> {
    return this.http.get<RetroSession>(`${this.baseUrl}/room/${roomCode}`);
  }

  create(request: CreateRetroRequest): Observable<RetroSession> {
    return this.http.post<RetroSession>(this.baseUrl, request);
  }

  advancePhase(retroId: string): Observable<RetroSession> {
    return this.http.post<RetroSession>(
      `${this.baseUrl}/${retroId}/advance`,
      {}
    );
  }

  /* ---- Items ---- */

  getItems(retroId: string): Observable<RetroItem[]> {
    return this.http.get<RetroItem[]>(`${this.baseUrl}/${retroId}/items`);
  }

  createItem(request: CreateItemRequest): Observable<RetroItem> {
    return this.http.post<RetroItem>(
      `${this.baseUrl}/${request.retroId}/items`,
      request
    );
  }

  /* ---- AI Preview ---- */

  previewItem(retroId: string, content: string): Observable<PreviewResponse> {
    return this.http.post<PreviewResponse>(
      `${this.baseUrl}/${retroId}/preview`,
      { content }
    );
  }

  /* ---- Voting ---- */

  vote(retroId: string, itemId: string): Observable<RetroItem> {
    return this.http.post<RetroItem>(
      `${this.baseUrl}/${retroId}/items/${itemId}/vote`,
      {}
    );
  }

  /* ---- Actions ---- */

  promoteToAction(request: PromoteToActionRequest): Observable<ActionItem> {
    return this.http.post<ActionItem>(
      `${this.baseUrl}/actions`,
      request
    );
  }

  getSmartCoach(retroItemId: string): Observable<SmartCoachResponse> {
    return this.http.get<SmartCoachResponse>(
      `${this.baseUrl}/items/${retroItemId}/smart-coach`
    );
  }

  getActions(retroId: string): Observable<ActionItem[]> {
    return this.http.get<ActionItem[]>(`${this.baseUrl}/${retroId}/actions`);
  }

  /* ---- Summary ---- */

  getSummary(retroId: string): Observable<RetroSummary> {
    return this.http.get<RetroSummary>(`${this.baseUrl}/${retroId}/summary`);
  }
}
