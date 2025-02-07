export class CustomError extends Error {
    constructor(
      public message: string,
      public statusCode: number,
      public errorCode?: string,
      public details?: any
    ) {
      super(message);
      this.name = this.constructor.name;
    }
  }
  
  export class ValidationError extends CustomError {
    constructor(message: string, details?: any) {
      super(message, 400, 'VALIDATION_ERROR', details);
    }
  }
  
  export class AuthenticationError extends CustomError {
    constructor(message: string = 'Authentication failed') {
      super(message, 401, 'AUTHENTICATION_ERROR');
    }
  }
  
  export class AuthorizationError extends CustomError {
    constructor(message: string = 'Insufficient permissions') {
      super(message, 403, 'AUTHORIZATION_ERROR');
    }
  }
  
  export class NotFoundError extends CustomError {
    constructor(resource: string) {
      super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
    }
  }