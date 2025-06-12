export default class Product {
    constructor({ id, name, description, category, price, stock, image_url, created_at, updated_at }) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.category = category;
      this.price = parseFloat(price);
      this.stock = parseInt(stock, 10);
      this.image_url = image_url;
      this.createdAt = created_at;
      this.updatedAt = updated_at;
    }

    get formattedPrice() {
        return `$${this.price.toFixed(2)}`;
    }
  
    static fromApi(data) {
      return new Product(data);
    }
  }
  