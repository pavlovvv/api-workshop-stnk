import { Query } from "express-serve-static-core";

export interface TypedRequestBody<T> extends Express.Request {
  body: T;
}

export interface TypedRequestQuery<T extends Query> extends Express.Request {
  query: T;
}

export interface TypedRequest<T extends Query, U> extends Express.Request {
  body: U;
  query: T;
}

export type TypedResponse<T> = Omit<
  Express.Response,
  "json" | "status" | "cookie" | "clearCookie"
> & {
  json(data: T): TypedResponse<T>;
} & { status(code: number): TypedResponse<T> } & {
  cookie(
    cookieName: string,
    cookieData: string | number,
    settings?: {
      maxAge?: number;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: string;
    }
  ): TypedResponse<T>;
} & { clearCookie(cookieName: string): TypedResponse<T> };
