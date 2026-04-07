export interface JwtPayload {
    role: string;
    sub: string;
    iat:number;
    exp: number;
}