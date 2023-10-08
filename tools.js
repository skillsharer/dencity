function getDate(){
  let currentDate = new Date(); // Get the current date and time
  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();
  let seconds = currentDate.getSeconds();
  return [hours, minutes, seconds]
}