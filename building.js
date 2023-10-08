class Building {
    constructor(x, y, width, depth, shape) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.depth = depth;
        this.height = random(minBuildingHeight, maxBuildingHeight);
        this.shape = this.define_shape(shape);
        this.quarter = this.check_quarter();
        this.buildingColor = this.setColor();
    }
  
    setColor(){
      let colorValues = [
        [90, 105, 136],
        [217, 225, 233],
        [134, 149, 165],
        [181, 190, 198],
        [65, 78, 91],
        [255, 219, 153],
        [198, 168, 125],
        [255, 214, 90],
        [255, 158, 73],
        [242, 85, 96],
        [45, 156, 219],
        [135, 196, 64],
        [183, 149, 11],
        [230, 126, 34],
        [105, 78, 53],
        [204, 142, 105],
        [248, 227, 196],
        [122, 110, 84],
        [143, 172, 193],
        [177, 144, 113],
        [237, 201, 161]
      ];
      let colorValue = colorValues[Math.floor(Math.random() * colorValues.length)];
      return color(...colorValue);
    }
    
    setBoxWindowSize(boxWidth, boxHeight, boxDepth){
      let windowSizeX = boxWidth / random(1,10);
      let windowSizeY = boxHeight / random(1,10);
      let windowSizeZ = boxDepth / random(1,10);
      let gapSizeX = windowSizeX / random(1,10);
      let gapSizeY = windowSizeY / random(1,10);
      let gapSizeZ = windowSizeZ / random(1,10);
      return [windowSizeX, windowSizeY, windowSizeZ, gapSizeX, gapSizeY, gapSizeZ];
    }
  
   check_quarter() {
      /*
      0: Top-left
      1: Top-Right
      2: Bottom-left
      3: Bottom-right
      */
      let horizontal = (this.x <= canvasWidth / 2) ? 0 : 1;
      let vertical = (this.y <= canvasHeight / 2) ? 0 : 1;
      return 2 * vertical + horizontal;
    }
  
    define_shape(shape) {
        let buildingShape;
        let shapes;
        let weights;
        let cumulativeWeights = [];
        let randomValue;

        if (shape === 'rectangle') {
            shapes = ['rectangle', 'set_back'];
            weights = [0.9, 0.1];  // Set your desired weights here
        } else {
            shapes = ['rectangle', 'set_back', 'cylinder'];
            weights = [0.8, 0.1, 0.1];  // Set your desired weights here
        }

        // Calculate cumulative weights
        let cumulativeWeight = 0;
        for (let weight of weights) {
            cumulativeWeight += weight;
            cumulativeWeights.push(cumulativeWeight);
        }

        randomValue = Math.random();
        for (let i = 0; i < cumulativeWeights.length; i++) {
            if (randomValue < cumulativeWeights[i]) {
                buildingShape = shapes[i];
                break;
            }
        }
        return buildingShape;
    }
  
    setBuildingLocation(){
      let xc = this.x + this.width / 2;
      let yc = this.y + this.depth / 2;
      let zc = this.height / 2;
      translate(xc, yc, zc);
      rotateX(HALF_PI);
    }
  
    defineBox(){
      this.setBuildingLocation();
      let currentHeight;
      if (random() <= 0.9){
        push();
          translate(0, buildingFrameHeight/2, 0);
          drawHandDrawnBoxWithoutTop(this.width, this.height + buildingFrameHeight, this.depth, maxDisplacement);
        pop();
        drawTopFrame(this.width, this.height, this.depth, this.buildingColor);
        currentHeight = this.height + buildingFrameHeight;
      } else {
        drawHandDrawnBox(this.width, this.height, this.depth, maxDisplacement);
        currentHeight = this.height;
      }
      fill(this.buildingColor);
      box(this.width, this.height, this.depth);
      drawWindows(this, this.width, currentHeight, this.depth);
    }

    defineCylinder(){
      this.setBuildingLocation();
      const radius = this.width / 2;
      fill(this.buildingColor);
      cylinder(radius, this.height);
      drawHandDrawnCylinder(radius, this.height, 20, maxDisplacement);
    }

    defineSetBack(setBacks = [1, 0.6]){
      const xc = this.x + this.width / 2;
      const yc = this.y + this.depth / 2;

      for (let i = 0; i < setBacks.length; ++i){
        const currentWidth = this.width * setBacks[i];
        const currentDepth = this.depth * setBacks[i];
        const currentHeight = this.height / setBacks.length;
        const zc = currentHeight / 2 + (i * currentHeight);
        push();
          translate(xc, yc, zc);
          rotateX(HALF_PI);
          push();
            translate(0, buildingFrameHeight/2, 0);
            drawHandDrawnBoxWithoutTop(currentWidth, currentHeight + buildingFrameHeight, currentDepth, maxDisplacement);
          pop();
          drawTopFrame(currentWidth, currentHeight, currentDepth, this.buildingColor);
          fill(this.buildingColor);
          box(currentWidth, currentHeight, currentDepth);
          drawWindows(this, currentWidth, currentHeight, currentDepth);
        pop();
      }
    }

    drawBuilding(){
      push();    
      switch(this.shape){
        case 'rectangle':
          this.defineBox();
          break;
        case 'cylinder':
          this.defineCylinder();
          break;  
        case 'set_back':
          this.defineSetBack();
          break;
      };
      pop();
    }
}

function drawCylinderWindows(building) {
    push();

    // Colors for window
    fill(100, 100, 250, 150);  // Semi-transparent blue for window
    stroke(0);  // Black border

    // Calculate the circumference
    const circumference = Math.PI * building.width;  // Using width as diameter

    // Calculate number of windows based on available space and window size
    let numWindowsAround = Math.floor(circumference / building.windowSizeX);
    let numWindowsVertical = Math.floor(building.height / building.windowSizeY);

    // Calculate the angular distance between windows
    let angleBetweenWindows = TWO_PI / numWindowsAround;

    // Draw windows
    for (let i = 0; i < numWindowsAround; i++) {
        for (let j = 0; j < numWindowsVertical; j++) {
            let xCenter = (building.width / 2) * Math.cos(i * angleBetweenWindows);
            let yCenter = j * building.windowSizeY - building.height/2;
            let zCenter = (building.width / 2) * Math.sin(i * angleBetweenWindows);

            // Points for the window
            let topLeft = createVector(xCenter - (building.windowSizeX / 2) * Math.sin(i * angleBetweenWindows),
                                      yCenter,
                                      zCenter + (building.windowSizeX / 2) * Math.cos(i * angleBetweenWindows));

            let topRight = createVector(xCenter + (building.windowSizeX / 2) * Math.sin(i * angleBetweenWindows),
                                      yCenter,
                                      zCenter - (building.windowSizeX / 2) * Math.cos(i * angleBetweenWindows));

            let bottomLeft = createVector(xCenter - (building.windowSizeX / 2) * Math.sin(i * angleBetweenWindows),
                                      yCenter + building.windowSizeY,
                                      zCenter + (building.windowSizeX / 2) * Math.cos(i * angleBetweenWindows));

            let bottomRight = createVector(xCenter + (building.windowSizeX / 2) * Math.sin(i * angleBetweenWindows),
                                      yCenter + building.windowSizeY,
                                      zCenter - (building.windowSizeX / 2) * Math.cos(i * angleBetweenWindows));

            beginShape();
            vertex(topLeft.x, topLeft.y, topLeft.z);
            vertex(topRight.x, topRight.y, topRight.z);
            vertex(bottomRight.x, bottomRight.y, bottomRight.z);
            vertex(bottomLeft.x, bottomLeft.y, bottomLeft.z);
            endShape(CLOSE);
        }
    }

    pop();
}

function drawWindows(building, boxWidth, boxHeight, boxDepth) {
    push();
    const quarter = building.quarter;
    const windowProperties = building.setBoxWindowSize(boxWidth, boxHeight, boxDepth);
    const windowSizeX = windowProperties[0];
    const windowSizeY = windowProperties[1];
    const windowSizeZ = windowProperties[2];
    const gapSizeX = windowProperties[3];
    const gapSizeY = windowProperties[4];
    const gapSizeZ = windowProperties[5];

    const actualWindowSizeX = windowSizeX - gapSizeX;
    const actualWindowSizeY = windowSizeY - gapSizeY;
    const actualWindowSizeZ = windowSizeZ - gapSizeZ;

    const numWindowsX = Math.floor(boxWidth/windowSizeX);
    const numWindowsY = Math.floor(boxHeight/windowSizeY);
    const numWindowsZ = Math.floor(boxDepth/windowSizeZ);

    const halfWidth = -boxWidth/2;
    const halfHeight = -boxHeight/4;
    const halfDepth = -boxDepth/2;
  
    const halfGapSizeX = gapSizeX/2;
    const halfGapSizeY = gapSizeY/2;
    const halfGapSizeZ = gapSizeZ/2;

    const displacedVertex = (x, y, z = undefined, displacements) => { 
        if (z === undefined) {
            vertex(x + displacements[0], y + displacements[1]);
        } else {
            vertex(x + displacements[0], y + displacements[1], z);
        }
    };

    const calculateVertices = (i, j, face) => {
        // Calculate the total window space including gaps for width, height, and depth
        const totalWindowWidth = numWindowsX * windowSizeX;
        const totalWindowHeight = numWindowsY * windowSizeY;
        const totalWindowDepth = numWindowsZ * windowSizeZ;

        // Calculate the remaining space after placing the windows
        const remainingWidth = boxWidth - totalWindowWidth;
        const remainingHeight = boxHeight - totalWindowHeight;
        const remainingDepth = boxDepth - totalWindowDepth;

        // Calculate the offsets to center the windows
        const offsetX = remainingWidth / 2;
        const offsetY = remainingHeight / 2; 
        const offsetZ = remainingDepth / 2;

        const ix = halfWidth + offsetX + i * windowSizeX + halfGapSizeX; // Adjusted starting position for x
        const jy = halfHeight + offsetY + j * windowSizeY + halfGapSizeY; // Adjusted starting position for y
        const iz = halfDepth + offsetZ + i * windowSizeZ + halfGapSizeZ; // Adjusted starting position for z

        const displacements = Array.from({ length: 4 }, () => [
            random(-maxDisplacement, maxDisplacement),
            random(-maxDisplacement, maxDisplacement)
        ]);

        switch (face) {
            case 'front':
                return displacements.map((d, idx) => {
                    const base = [
                        [ix, jy],
                        [ix + actualWindowSizeX, jy],
                        [ix + actualWindowSizeX, jy + actualWindowSizeY],
                        [ix, jy + actualWindowSizeY]
                    ];
                    return [base[idx][0] + d[0], base[idx][1] + d[1]];
                });
            case 'right':
                return displacements.map((d, idx) => {
                    const base = [
                        [boxWidth / 2, jy, iz],
                        [boxWidth / 2, jy + actualWindowSizeY, iz],
                        [boxWidth / 2, jy + actualWindowSizeY, iz + actualWindowSizeZ],
                        [boxWidth / 2, jy, iz + actualWindowSizeZ]
                    ];
                    return [base[idx][0] + d[0], base[idx][1] + d[1], base[idx][2]];
                });
            case 'left':
                return displacements.map((d, idx) => {
                    const base = [
                        [halfWidth, jy, iz],
                        [halfWidth, jy + actualWindowSizeY, iz],
                        [halfWidth, jy + actualWindowSizeY, iz + actualWindowSizeZ],
                        [halfWidth, jy, iz + actualWindowSizeZ]
                    ];
                    return [base[idx][0] + d[0], base[idx][1] + d[1], base[idx][2]];
                });
            case 'back':
                return displacements.map((d, idx) => {
                    const base = [
                        [ix, jy, boxDepth/2],
                        [ix + actualWindowSizeX, jy, boxDepth/2],
                        [ix + actualWindowSizeX, jy + actualWindowSizeY, boxDepth/2],
                        [ix, jy + actualWindowSizeY, boxDepth/2]
                    ];
                    return [base[idx][0] + d[0], base[idx][1] + d[1], base[idx][2]];
                });
        }
    };

    const drawFaceWindows = (face, numX, numY, translateX, translateY, translateZ) => {
        push();
        translate(translateX, translateY, translateZ);
        for (let i = 0; i < numX; i++) {
            for (let j = 0; j < numY; j++) {
                const vertices = calculateVertices(i, j, face);
                beginShape();
                vertices.forEach(v => vertex(...v)); // Directly use the displaced vertices
                endShape(CLOSE);
            }
        }
        pop();
    };
  
    fill(188, 180, 180);
    stroke(0);

    if ([0, 1].includes(quarter)) drawFaceWindows('front', numWindowsX, numWindowsY, 0, halfHeight, halfDepth - 1);
    if ([0, 2].includes(quarter)) drawFaceWindows('right', numWindowsZ, numWindowsY, 1, halfHeight, 0);
    if ([1, 3].includes(quarter)) drawFaceWindows('left', numWindowsZ, numWindowsY, -1, halfHeight, 0);
    if ([2, 3].includes(quarter)) drawFaceWindows('back', numWindowsX, numWindowsY, 0, halfHeight, 1);
  pop();
}

function drawHandDrawnCylinder(radius, height, segments, maxDisplacement, horizontalLines = 5) {
    stroke(0);
    strokeWeight(1);

    const disp = () => random(-maxDisplacement, maxDisplacement);

    const topPoints = [];
    const bottomPoints = [];
    const midPoints = Array.from({ length: horizontalLines }, () => []);

    for (let i = 0; i < segments; i++) {
        let theta = TWO_PI / segments * i;
        let x = radius * cos(theta);
        let y = radius * sin(theta);

        topPoints.push([x + disp(), height / 2 + disp(), y + disp()]);
        bottomPoints.push([x + disp(), -height / 2 + disp(), y + disp()]);

        for (let j = 0; j < horizontalLines; j++) {
            let fraction = (j + 1) / (horizontalLines + 1);
            let z = lerp(-height / 2, height / 2, fraction);
            midPoints[j].push([x + disp(), z + disp(), y + disp()]);
        }
    }

    // Draw the top and bottom circles
    for (let i = 0; i < segments; i++) {
        let nextIdx = (i + 1) % segments;
        
        line(...topPoints[i], ...topPoints[nextIdx]);
        line(...bottomPoints[i], ...bottomPoints[nextIdx]);
    }

    // Draw the sides of the cylinder
    for (let i = 0; i < segments; i++) {
        line(...topPoints[i], ...bottomPoints[i]);
    }

    // Draw the horizontal lines
    for (let j = 0; j < horizontalLines; j++) {
        for (let i = 0; i < segments; i++) {
            let nextIdx = (i + 1) % segments;
            line(...midPoints[j][i], ...midPoints[j][nextIdx]);
        }
    }
}

function drawTopFrame(boxWidth, boxHeight, boxDepth, buildingColor) {
  // Front and Back horizontal frame bars
  fill(buildingColor);
  push();
  translate(0, boxHeight/2 + buildingFrameHeight/2, boxDepth/2 - buildingFrameInset/2);
  box(boxWidth, buildingFrameHeight, buildingFrameInset);
  drawHandDrawnFrame(boxWidth, buildingFrameHeight/2, buildingFrameInset, maxDisplacement, PI);
  translate(0, 0, -boxDepth + buildingFrameInset);
  box(boxWidth, buildingFrameHeight, buildingFrameInset);
  drawHandDrawnFrame(boxWidth, buildingFrameHeight, buildingFrameInset, maxDisplacement);
  pop();

  // Left and Right horizontal frame bars
  push();
  translate(-boxWidth/2 + buildingFrameInset/2, boxHeight/2 + buildingFrameHeight/2, 0);
  box(buildingFrameInset, buildingFrameHeight, boxDepth - 2 * buildingFrameInset);
  drawHandDrawnFrame(boxDepth, buildingFrameHeight, buildingFrameInset, maxDisplacement, HALF_PI);
  translate(boxWidth - buildingFrameInset, 0, 0);
  box(buildingFrameInset, buildingFrameHeight, boxDepth - 2 * buildingFrameInset);
  drawHandDrawnFrame(boxDepth, buildingFrameHeight, buildingFrameInset, maxDisplacement, -HALF_PI);
  pop();
}

function drawHandDrawnFrame(boxWidth, boxHeight, boxDepth, maxDisplacement, rotation=0){
  const disp = () => random(-maxDisplacement*2, maxDisplacement*2);
  const points = [
        [-boxWidth/2 + buildingFrameInset, -boxHeight/2, boxDepth/2], // inside bottom left 0
        [boxWidth/2 - buildingFrameInset, -boxHeight/2, boxDepth/2], // inside bottom right 1
        [boxWidth/2 - buildingFrameInset, boxHeight/2, boxDepth/2], // inside top right 2
        [-boxWidth/2 + buildingFrameInset, boxHeight/2, boxDepth/2], // inside top left 3
        [-boxWidth/2, -boxHeight/2, -boxDepth/2], // outside bottom left 4
        [boxWidth/2, -boxHeight/2, -boxDepth/2], // outside bottom right 5
        [boxWidth/2, boxHeight/2, -boxDepth/2], // outside top right 6
        [-boxWidth/2, boxHeight/2, -boxDepth/2] // outside top left 7
    ].map(pt => pt.map(val => val + disp()));
      const edgesToDraw = [
        [points[0], points[1]],
        [points[1], points[2]],
        [points[2], points[3]],
        [points[3], points[0]],
        [points[6], points[7]],
    ];
    push();
    rotateY(rotation);
    translate(0, 2, 0);  // Add the slight Z offset here
    fill((247,236,215)); // Fill with white
    // Draw the trapezoid
    beginShape();
    vertex(...points[2]);
    vertex(...points[6]);
    vertex(...points[7]);
    vertex(...points[3]);
    endShape(CLOSE);
    stroke(0);
    strokeWeight(1);
    for (const edge of edgesToDraw) {
        line(...edge[0], ...edge[1]);
    }
    pop();
}

function drawHandDrawnBoxWithoutTop(boxWidth, boxHeight, boxDepth, maxDisplacement) {
    push();
    const disp = () => random(-maxDisplacement, maxDisplacement);
    const points = [
        [-boxWidth/2, -boxHeight/2, boxDepth/2],
        [boxWidth/2, -boxHeight/2, boxDepth/2],
        [boxWidth/2, boxHeight/2, boxDepth/2],
        [-boxWidth/2, boxHeight/2, boxDepth/2],
        [-boxWidth/2, -boxHeight/2, -boxDepth/2],
        [boxWidth/2, -boxHeight/2, -boxDepth/2],
        [boxWidth/2, boxHeight/2, -boxDepth/2],
        [-boxWidth/2, boxHeight/2, -boxDepth/2]
    ].map(pt => pt.map(val => val + disp()));
  
      const edgesToDraw = [
        [points[0], points[1]],
        [points[1], points[2]],
        [points[3], points[0]],
        [points[4], points[5]],
        [points[5], points[6]],
        [points[7], points[4]],
        [points[0], points[4]],
        [points[1], points[5]],
    ];
    stroke(0);
    strokeWeight(1);
    for (const edge of edgesToDraw) {
        line(...edge[0], ...edge[1]);
    }
    pop();
  
}

function drawHandDrawnBox(boxWidth, boxHeight, boxDepth, maxDisplacement) {

    const disp = () => random(-maxDisplacement, maxDisplacement);

    const points = [
        [-boxWidth/2, -boxHeight/2, boxDepth/2],
        [boxWidth/2, -boxHeight/2, boxDepth/2],
        [boxWidth/2, boxHeight/2, boxDepth/2],
        [-boxWidth/2, boxHeight/2, boxDepth/2],
        [-boxWidth/2, -boxHeight/2, -boxDepth/2],
        [boxWidth/2, -boxHeight/2, -boxDepth/2],
        [boxWidth/2, boxHeight/2, -boxDepth/2],
        [-boxWidth/2, boxHeight/2, -boxDepth/2]
    ].map(pt => pt.map(val => val + disp()));

    const edgesToDraw = [
        [points[0], points[1]],
        [points[1], points[2]],
        [points[2], points[3]],
        [points[3], points[0]],
        [points[4], points[5]],
        [points[5], points[6]],
        [points[6], points[7]],
        [points[7], points[4]],
        [points[0], points[4]],
        [points[1], points[5]],
        [points[2], points[6]],
        [points[3], points[7]]
    ];
    push();
    stroke(0);
    strokeWeight(1);
    for (const edge of edgesToDraw) {
        line(...edge[0], ...edge[1]);
    }
    pop();
}

function defineBuildings(grid) {
    let buildings = [];

    function canPlaceBuilding(x, y, width, depth) {
        if (x + width + gridSize > grid.length || y + depth + gridSize > grid[0].length || x - gridSize < 0 || y - gridSize < 0) {
            return false;
        }

        for (let i = x - gridSize; i < x + width + gridSize; i++) {
            for (let j = y - gridSize; j < y + depth + gridSize; j++) {
                if (grid[i][j].type !== null) {
                    return false;
                }
            }
        }

        return true;
    }

    function placeBuilding(x, y, width, depth, shape) {
        let building = new Building(x, y, width, depth, shape);
        building.drawBuilding();
        buildings.push(building);

        for (let i = x - gridSize; i < x + width + gridSize; i++) {
            for (let j = y - gridSize; j < y + depth + gridSize; j++) {
                if(i < x || i >= x + width || j < y || j >= y + depth) {
                    grid[i][j].setType('border');
                } else {
                    grid[i][j].setType('building');
                }
            }
        }
    }

    let points = [];
    for (let i = gridSize; i < grid.length - 1 - gridSize; i += gridSize) {
        for (let j = gridSize; j < grid[0].length - 1 - gridSize; j += gridSize) {
            if (i % gridSize === 0 && j % gridSize === 0) {
                points.push({x: i, y: j});
            }
        }
    }

    points.sort(() => Math.random() - 0.5);

    for (let point of points) {
        let shape = Math.random() < 0.5 ? 'square' : 'rectangle';
        let width, depth;

        if (shape === 'rectangle') {
            width = Math.floor((Math.random() * (maxBuildingSize - minBuildingSize + 1) + minBuildingSize) / gridSize) * gridSize;
            depth = Math.floor((Math.random() * (maxBuildingSize - minBuildingSize + 1) + minBuildingSize) / gridSize) * gridSize;
        } else {
            width = depth = Math.floor((Math.random() * (maxBuildingSize - minBuildingSize + 1) + minBuildingSize) / gridSize) * gridSize;
        }

        if (canPlaceBuilding(point.x, point.y, width, depth)) {
            placeBuilding(point.x, point.y, width, depth, shape);
        }
    }

    return buildings;
}