/* This code runs on *all* pages */

window.onload = function() {
//     document.querySelector("nav").insertAdjacentHTML(
//       "afterEnd",
//       `
//       <div class="section">
//         <h1>It's @breakfast_for_dinner's birthday!!!</h1>
//           Wish her a happy birthday :)
//           <br>
//           <a href="https://scratch.mit.edu/users/breakfast_for_dinner/#comments">https://scratch.mit.edu/users/breakfast_for_dinner/</a>
//       </div>
//   `
//     );
  
  
  // if (isAdmin) {
  //     createAdminPanel();
  // }

  document.title += " | Itching Discovery";
};


/* ADMIN PANEL - If you wanna mess around, go ahead, but to actually use it you need authentification */
let isAdmin = false;
if (localStorage.getItem('isAdmin') == 'true') isAdmin = true;

function createAdminPanel() {
    const adminPanel = document.createElement('div');
    adminPanel.style.position = 'fixed';
    adminPanel.style.top = '50px';
    adminPanel.style.left = '50px';
    adminPanel.style.width = 'max-content;';
    adminPanel.style.border = '1px solid #000';
    adminPanel.style.borderRadius = '5px';
    adminPanel.style.zIndex = '1000';
    adminPanel.style.animation = 'admin 10s cubic-bezier(0.98, 0.57, 0.58, 1)';
    adminPanel.style.animationIterationCount = 'infinite';

    const header = document.createElement('div');
    header.innerText = 'Admin Panel';
    header.style.backgroundColor = 'rgba(0,0,0,0.8)';
    header.style.color = 'white';
    header.style.padding = '10px';
    header.style.cursor = 'move';
    header.style.borderTopLeftRadius = '5px';
    header.style.borderTopRightRadius = '5px';

    const content = document.createElement('div');
    content.innerHTML = `
        <input id="urladmin" placeholder="Project URL..." /><br/>
        <input id="tag1admin" placeholder="tagPrimary" /><br/>
        <input id="tag2admin" placeholder="tagSecondary" /><br/>
        <input id="passadmin" placeholder="Password" /><br/>
        <button onclick="adminUpdate()">update</button>
        <button onclick="adminRemove()">remove</button>
    `;
    content.style.padding = '10px';
    content.style.backgroundColor = 'white';
    content.style.borderBottomLeftRadius = '5px';
    content.style.borderBottomRightRadius = '5px';

    adminPanel.appendChild(header);
    adminPanel.appendChild(content);
    document.body.appendChild(adminPanel);

    makeDraggable(header, adminPanel);
}

function makeDraggable(dragElement, moveElement) {
    let offsetX = 0, offsetY = 0, initialX = 0, initialY = 0;

    dragElement.addEventListener('mousedown', startDrag);

    function startDrag(e) {
        e.preventDefault();
        initialX = e.clientX;
        initialY = e.clientY;
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }

    function drag(e) {
        e.preventDefault();
        offsetX = initialX - e.clientX;
        offsetY = initialY - e.clientY;
        initialX = e.clientX;
        initialY = e.clientY;
        moveElement.style.top = (moveElement.offsetTop - offsetY) + 'px';
        moveElement.style.left = (moveElement.offsetLeft - offsetX) + 'px';
    }

    function stopDrag() {
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }
}

function adminUpdate() {
    let data = {
        url: document.getElementById('urladmin').value,
        tag1: document.getElementById('tag1admin').value,
        tag2: document.getElementById('tag2admin').value,
        password: document.getElementById('passadmin').value
    };

    fetch('/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(res => {document.open('text/html').write(res);})
    .catch(err => alert('Failed to update.'));
}

function adminRemove() {
    if (confirm("Are you sure you want to delete this project?")) {
        let data = {
            url: document.getElementById('urladmin').value,
            password: document.getElementById('passadmin').value
        };

        fetch('/admin/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.text())
    .then(res => {document.open('text/html').write(res);})
    }
}