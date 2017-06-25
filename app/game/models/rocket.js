export class Rocket {
  constructor(params) {
    this.sprite = PIXI.Sprite.fromImage("static/images/rocket.png");
    this.sprite.id = params.id;
    this.sprite.x = params.x;
    this.sprite.y = params.y;
    this.sprite.height = 50;
    this.sprite.width = 50;
    return this.sprite;
  }
}
