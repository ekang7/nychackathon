let root,
  nodeCount = 0;
let newNode, description;
const nodeSize = 50; // Increased node size for better visibility
const levelHeight = 200; // Vertical spacing between levels
const baseSpacing = 150; // Base horizontal spacing between nodes
const addButtonSize = 20; // Size of the add button
const deleteButtonSize = 20; // Size of the delete button
const fontSize = 14; // Font size for node labels

const existingNodes = [];
const rootName = "climate change";
const rootNameDisplayed = "climate\nchange";
const descriptions = new Object();

// document.getElementById('inputForm').addEventListener('submit', function(event){
//   event.preventDefault(); // Prevents the form from submitting in the traditional way
//   let userInput = document.getElementById('inputField').value;
//   console.log("User input:", userInput);
//   // Add additional code here to handle the input
// });

function setup() {
  createCanvas(windowWidth, windowHeight);
  root = new Node(width / 2, levelHeight, nodeSize, null, 0, rootNameDisplayed);
}

function draw() {
  background(255);
  if (root) {
    root.drawConnections();
    root.drawNode();
  }
}

function mousePressed() {
  if (root) {
    let deleteResult = root.clicked(mouseX, mouseY);
    if (deleteResult) {
      if (deleteResult !== "deleteRoot") {
        root.updateSpacing(); // Update the entire tree's layout
      } else {
        root = null;
      }
    }
  }
}

class Node {
  constructor(x, y, r, parent, depth, label) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.parent = parent;
    this.children = [];
    this.depth = depth;
    this.label = label;
  }

  drawNode() {
    fill(100, 100, 250);
    ellipse(this.x, this.y, this.r * 2);
    fill(0);
    textSize(fontSize);
    textAlign(CENTER, CENTER);
    text(this.label, this.x, this.y);

    fill(0, 255, 0);
    ellipse(this.x + this.r, this.y, addButtonSize);
    fill(0);
    text("+", this.x + this.r, this.y);

    fill(255, 0, 0);
    ellipse(this.x - this.r, this.y, deleteButtonSize);
    fill(255);
    text("x", this.x - this.r, this.y);

    this.children.forEach((child) => child.drawNode());
  }

  drawConnections() {
    if (this.parent) {
      stroke(0);
      noFill();
      bezier(
        this.parent.x,
        this.parent.y,
        (this.x + this.parent.x) / 2,
        this.parent.y,
        this.x,
        (this.y + this.parent.y) / 2,
        this.x,
        this.y
      );
    }
    this.children.forEach((child) => child.drawConnections());
  }

  async clicked(px, py) {
    if (dist(px, py, this.x + this.r, this.y) < addButtonSize / 2) {
      const dataToSend = {
        root: rootName,
        existingNodes: existingNodes.toString(),
      };
      fetch("http://127.0.0.1:5000/new_node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })
        .then((response) => response.json())
        .then((data) => {
          let newNode = data.newNode;
          // Create and add the new node here, after the data is received
          let child = new Node(
            this.x,
            this.y + levelHeight,
            nodeSize,
            this,
            this.depth + 1,
            newNode
          );
          this.children.push(child);
          this.updateSpacing(); // Update the entire tree's layout
          existingNodes.push(newNode);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      return true;
    }

    if (dist(px, py, this.x - this.r, this.y) < deleteButtonSize / 2) {
      if (this.parent) {
        let index = this.parent.children.indexOf(this);
        this.parent.children.splice(index, 1);
        return true;
      } else {
        return "deleteRoot";
      }
    }

    for (let child of this.children) {
      let childClicked = child.clicked(px, py);
      if (childClicked) {
        return true;
      }
    }
    if (this.label in descriptions) {
      console.log("descriptions: ", descriptions);
      console.log("this.label: ", this.label);
      description = descriptions[this.label];
    } else {
      const dataToSend = {
        root: rootName,
        node: this.label,
      };
      await fetch("http://127.0.0.1:5000/get_description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })
        .then((response) => response.json())
        .then((data) => {
          description = data.description;
          // Create and add the new node here, after the data is received
          descriptions[this.label] = description;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
    alert(description);
    return true;
  }

  updateSpacing() {
    let totalWidth = this.calculateSubtreeWidth();
    this.repositionChildren(this.x - totalWidth / 2, 0);
  }

  calculateSubtreeWidth() {
    if (this.children.length === 0) {
      return baseSpacing;
    }
    let totalWidth = 0;
    this.children.forEach((child) => {
      totalWidth += child.calculateSubtreeWidth();
    });
    return totalWidth;
  }

  repositionChildren(x, accumulatedWidth) {
    this.children.forEach((child) => {
      let childWidth = child.calculateSubtreeWidth();
      child.x = x + accumulatedWidth + childWidth / 2;
      child.repositionChildren(child.x - childWidth / 2, 0);
      accumulatedWidth += childWidth;
    });
  }
}
