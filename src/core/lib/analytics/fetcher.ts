/** 外部 API の呼び出し口。テストで通信を差し替えられるよう fetch と同じ形で受け取る。 */
export type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
