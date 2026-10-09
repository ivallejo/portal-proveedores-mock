import { GetAccessTokenPort } from '../ports/in/get-access-token.port';
import { SessionStorePort } from '../ports/out/session-store.port';

export class GetAccessTokenUseCase implements GetAccessTokenPort {
  constructor(private readonly store: SessionStorePort) {}

  execute(): string | null {
    return this.store.accessToken();
  }
}
