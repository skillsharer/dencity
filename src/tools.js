function getDate(){
  let currentDate = new Date(); // Get the current date and time
  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();
  let seconds = currentDate.getSeconds();
  return [hours, minutes, seconds]
}

function randomColor(){
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
  let colorValue = colorValues[Math.floor($fx.rand() * colorValues.length)];
  return color(...colorValue);
}