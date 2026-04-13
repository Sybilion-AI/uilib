/** Response shape from the app-injected chat HTTP client. */
export interface ChatResponse {
  response: string;
  session_id: string | null;
}
