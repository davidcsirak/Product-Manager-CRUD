export class Product {
  constructor(
    public owner_id: number,
    public name: string,
    public price: number,
    public description: string,
    public created_at: Date
  ) {}
}
