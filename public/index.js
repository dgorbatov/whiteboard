"use strict";

(function() {
  const MAX_DIAMETER = 40;
  let buttonClicked = false;
  let x = 0;
  let y = 0;
  let color = "";
  let thickness = 50;
  let toolSelection = "pen";
  let drawings = []
  let intervalID;

  window.addEventListener("load", init);

  /**
   * Init Function
   */
  function init() {
    const canvas = id("whiteboard");

    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    setUpColors();
    setUpThickness();

    canvas.addEventListener("mousedown", mouseDown);
    window.addEventListener("mouseup", mouseUp);
    canvas.addEventListener("mousemove", mouseMoved);

    id("eraser").addEventListener("click", () => {
      if (!id("eraser").classList.contains("selected")) {
        removeSelected();
        id("eraser").classList.add("selected");
        toolSelection = "erase";
      }
    });

    id("pen").addEventListener("click", () => {
      if (!id("pen").classList.contains("selected")) {
        removeSelected();
        id("pen").classList.add("selected");
        toolSelection = "pen";
      }
    });

    intervalID = setInterval(() => {
      render(canvas.getContext("2d"));
    }, 0)
  }

  /**
   * Renders the canvas. Draws lines, rects, etc...
   * @param {Object} ctx - the canvas context
   */
  function render(ctx) {
    for (const drawing of drawings) {
      if (drawing.name === "pen" || drawing.name === "erase") {
        for (let i = 1; i < drawing.cords.length; ++i) {
          drawLine(
                   drawing.cords[i - 1].x, drawing.cords[i - 1].y,
                   drawing.cords[i].x, drawing.cords[i].y,
                   drawing.color, drawing.thickness
          );
        }
      }
    }
  }

  /**
   * TODO:
   * @param {Object} mouse - the current state of the mouse
   */
  function mouseMoved(mouse) {
    if (buttonClicked) {
      if (toolSelection === "pen" || toolSelection === "erase") {
        drawings[drawings.length - 1].cords.push({ x: x, y: y });
        x = mouse.offsetX;
        y = mouse.offsetY;
      }
    }
  }

  /**
   * Sets the canvas size to the screen size
   */
  function sizeCanvas() {
    const canvas = id("whiteboard");
    const ctx = canvas.getContext('2d');

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
  }

  /**
   * Removes all selected class's from the tool set
   */
  function removeSelected() {
    for (const child of qs("body > article").children) {
      if (child.classList.contains("selected")) {
        child.classList.remove("selected");
      }
    }
  }

  /**
   * Sets new coordinates, sets the button clicked var
   * @param {Mouse} mouse - mouse info
   */
  function mouseUp(mouse) {
    buttonClicked = false;
  }

  /**
   * Sets new coordinates, sets the button clicked var
   * @param {Mouse} mouse - mouse info
   */
  function mouseDown(mouse) {
    buttonClicked = true;
    x = mouse.offsetX;
    y = mouse.offsetY;

    if (toolSelection === "pen") {
      drawings.push({ name: "pen", color: color, thickness: thickness, cords: [] });
    } else if (toolSelection === "erase") {
      drawings.push({ name: "erase", color: "white", thickness: thickness, cords: [] });
    }
  }

  /**
   * Sets the event listeners for modifying thickness
   */
  function setUpThickness() {
    id("thickness").children[0].addEventListener("click", () => {
      id("thickness").children[1].classList.toggle("hidden");
    })

    id("thickness").children[1].addEventListener("input", () => {
      thickness = id("thickness").children[1].value;

      id("thickness").children[0].style.width =
        id("thickness").children[1].value / 100 * MAX_DIAMETER + "px";
      id("thickness").children[0].style.height =
        id("thickness").children[1].value / 100 * MAX_DIAMETER + "px";
    })
  }

  /**
   * Assign color, and event listener
   */
  function setUpColors() {
    color = getColor(findColorSelection());
    findColorSelection().addEventListener("click", selectColors);
  }

  /**
   * Switch views to the color selecting view
   */
  function selectColors() {
    for (const child of qs("body > article").children) {
      if (child.id !== "colors") {
        child.classList.add("hidden");
      }
    }

    id("colors").classList.add("full-screen");
    findColorSelection().removeEventListener("click", selectColors);

    for (const child of id("colors").children) {
      if (child.classList.contains("hidden")) {
        child.classList.remove("hidden");
      }
      child.addEventListener("click", selectColor);
    }
  }

  /**
   * Selects a new color
   */
  function selectColor() {
    for (const child of qs("body > article").children) {
      if (child.id !== "colors") {
        child.classList.remove("hidden");
      }
    }

    color = getColor(this);

    id("colors").classList.remove("full-screen");
    this.addEventListener("click", selectColors);

    for (const child of id("colors").children) {
      if (!child.classList.contains("hidden") && child !== this) {
        child.classList.add("hidden");
      }
      child.removeEventListener("click", selectColor);
    }
  }

  /**
   * Gets the color of an object
   * @param {Object} item - the object from where we get the color
   * @returns {String} - the color
   */
  function getColor(item) {
    return item.classList[1];
  }

  /**
   * Find the current color that is selected
   * @returns {Object} - the color selected
   */
  function findColorSelection() {
    let found;

    for (const child of id("colors").children) {
      if (!child.classList.contains("hidden")) {
        found = child;
      }
    }
    return found;
  }

  /**
   * Draws a line
   * @param {Number} x1 - the x cord of the previous position
   * @param {Number} y1 - the y cord of the previous position
   * @param {Number} x2 - the x cord of the new position
   * @param {Number} y2 - the y cord of the new position
   * @param {String} lineColor - the color of the line
   * @param {Number} lineThickness - the thickness of the line
   * @param {Object} ctx - the canvas context
   */
  function drawLine(x1, y1, x2, y2, lineColor, lineThickness) {
    const canvas = document.getElementById("whiteboard");
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineThickness;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
  }

  /** ------------------------------ Helper Functions  ------------------------------ */

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }
})();