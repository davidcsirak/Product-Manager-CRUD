export class User {
  constructor(
    public id: number,
    public email: string,
    public name: string,
    public password: string,
    public permissions: string[],
    private _token?: string,
    private _tokenExpirationDate?: Date
  ) {}

  get token() {
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }
    return this._token;
  }
}
