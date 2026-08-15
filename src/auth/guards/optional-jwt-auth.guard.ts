import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT guard — allows unauthenticated requests through,
 * but populates req.user when a valid Bearer token is present.
 * Used on public endpoints that need role-based auto-filtering
 * (e.g. GET /courses auto-filters by instructor when instructor is logged in).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    // Never throw — always allow the request through
    handleRequest(_err: any, user: any) {
        return user || null;
    }

    // Override canActivate so a missing/invalid token doesn't throw 401
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            await super.canActivate(context);
        } catch {
            // Swallow auth errors — unauthenticated requests are fine
        }
        return true;
    }
}
