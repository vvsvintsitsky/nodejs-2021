import jsonwebtoken from 'jsonwebtoken';

import { UserStorage } from '../storage/UserStorage';

interface TokenPayload {
  expiresAt: Date
}

export class AuthenticationService {
    constructor(
    private userStorage: UserStorage,
    private tokenExpirationTimeSeconds: number,
    private secret: string
    ) {}

    public async authenticate(login: string, password: string): Promise<string> {
        await this.userStorage.getByLoginAndPassword(login, password);

        const expiresAt = new Date(new Date().getTime() + this.tokenExpirationTimeSeconds * 1000);
        return jsonwebtoken.sign({ expiresAt }, this.secret);
    }

    public verifyToken(token: string): boolean {
        let tokenPayload: TokenPayload;
        try {
            tokenPayload = this.parseToken(token);
        } catch (error) {
            return false;
        }

        if (new Date() > tokenPayload.expiresAt) {
            return false;
        }

        return true;
    }

    private parseToken(token: string): TokenPayload {
        const payload = jsonwebtoken.verify(token, this.secret);

        if (!this.isValidPayload(payload)) {
            throw new Error('Invalid token payload');
        }

        return payload;
    }

    private isValidPayload(payload: unknown): payload is TokenPayload {
        return !!payload && typeof payload !== 'string';
    }
}
