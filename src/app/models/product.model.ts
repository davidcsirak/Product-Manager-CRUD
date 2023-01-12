export class Product {
  constructor(
    public id: number,
    public owner_id: number,
    public price: number,
    public description: string,
    public created_at: number
  ) {}
}
