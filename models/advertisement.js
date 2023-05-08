const uuidv4 = require('uuid').v4;

class Advertisement {

    constructor( detail, address, authorId, 
      price, photo, name, authorEmail, id = uuidv4())
      {
      this.id = id;
      this.name = name;
      this.authorId = authorId;
      this.detail = detail;
      this.address = address;
      this.approved = false;
      this.photo = photo;
      this.price = price;
      this._authorEmail = authorEmail;

      // Додаткові поля можна додати тут
    }
  
    approve(){
      this.approve = true;
    }
    get authorEmail() {
        return this._authorEmail;
    }

    set authorEmail(value) {
        this._authorEmail = value;
    }
    getId() {
      return this.id;
    }

    getPrice() {
      return this.price;
    }

    getAuthorId() {
      return this.authorId;
    }

    getName() {
      return this.name;
    }
  
    getDetail() {
      return this.detail;
    }
  
    getAddress() {
      return this.address;
    }
  
    isApproved() {
      return this.approved;
    }
  
    getPhoto() {
      return this.photo;
    }
  
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        authorId: this.authorId,
        detail: this.detail,
        address: this.address,
        approved: this.approved,
        photo: this.photo,
        price: this.price,
        _authorEmail: this._authorEmail


      };
    }
  
    static fromJSON(json) {
      const { name, authorId, detail, address, approved, photo, price } = json;
      const advertisement = new Advertisement( detail, address, authorId, price, photo, name);
      advertisement.id = id;
      advertisement.approved = approved;
      return advertisement;
    }
  
    // Методи для зміни даних об'яви можна додати тут
  
    toString() {
      return `${this.detail} (${this.address}): ${this.approved ? 'Approved' : 'Not Approved'}`;
    }
  }
  
  module.exports = Advertisement;
  