/* This code runs on *all* pages */

document.addEventListener("load", function () {
  document.querySelector("nav").insertAdjacentHTML(
    "afterEnd",
    `
  <div class="section">
    <h1>It's @breakfast_for_dinner's birthday!!!</h1>
      Wish her a happy birthday :)
      <br>
      <a href="https://scratch.mit.edu/users/breakfast_for_dinner/#comments">https://scratch.mit.edu/users/breakfast_for_dinner/</a>
  </div>`
  );
  
  document.title += ' | Itching Discovery';
});