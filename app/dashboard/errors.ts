export class DashboardException extends Error {
  code: string;

  constructor(code: string, message: string = '') {
    super(message || code);
    this.code = code;
  }
} 