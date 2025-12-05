import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // 🔥 Très important !

export interface VeraCheckResult {
  id: number;
  question: string;
  source: string;
  isTrue: boolean;
  reason: string;
  tweets: string[];
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class VeraApiService {
  // 🔥 En dev: http://localhost:3000/api
  // 🔥 En prod: https://vera-groupe-2.onrender.com/api
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 🔹 Chat classique
  ask(question: string): Observable<VeraCheckResult> {
    return this.checkQuestion(question, 'chat');
  }

  // 🔹 Méthode générique de check
  checkQuestion(
    question: string,
    source: string = 'chat'
  ): Observable<VeraCheckResult> {
    return this.http.post<VeraCheckResult>(`${this.baseUrl}/check`, {
      question,
      source,
    });
  }

  // 🔹 Historique des questions
  getQuestions(): Observable<VeraCheckResult[]> {
    return this.http.get<VeraCheckResult[]>(`${this.baseUrl}/questions`);
  }

  // 🔹 Login admin
  loginAdmin(
    email: string,
    password: string
  ): Observable<{ success: boolean; token: string }> {
    return this.http.post<{ success: boolean; token: string }>(
      `${this.baseUrl}/admin/login`,
      { email, password }
    );
  }
}
