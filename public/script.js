let root;
const nodeSize = 30;
const levelHeight = 100;
const horizontalSpacing = 80;

function setup() {
  createCanvas(windowWidth, windowHeight);
  root = new Node(width / 2, 100, nodeSize, null, 0);
}

function draw() {
  background(255);
  root.drawConnections();
  root.drawNode();
}

function mousePressed() {
  root.clicked(mouseX, mouseY);
  root.reposition(root.x, 0);
}

class Node {
  constructor(x, y, r, parent, depth) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.parent = parent;
    this.children = [];
    this.depth = depth;
  }

  drawNode() {
    fill(100, 100, 250);
    noStroke();
    ellipse(this.x, this.y, this.r * 2);
    this.children.forEach(child => child.drawNode());
  }

  drawConnections() {
    if (this.parent) {
      stroke(0);
      noFill();
      bezier(this.parent.x, this.parent.y, (this.x + this.parent.x) / 2, this.parent.y, this.x, (this.y + this.parent.y) / 2, this.x, this.y);
    }
    this.children.forEach(child => child.drawConnections());
  }

  clicked(px, py) {
    if (dist(px, py, this.x, this.y) < this.r) {
      let child = new Node(this.x, this.y + levelHeight, this.r, this, this.depth + 1);
      this.children.push(child);
    } else {
      this.children.forEach(child => child.clicked(px, py));
    }
  }

  reposition(x, siblingCount) {
    this.x = x;
    this.children.forEach((child, index) => {
      child.reposition(x - horizontalSpacing * (this.children.length - 1) / 2 + horizontalSpacing * index, this.children.length);
    });
  }
}
