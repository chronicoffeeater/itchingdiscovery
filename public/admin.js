fetch("/admintests",
{
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "POST",
    body: JSON.stringify({admin: localStorage.getItem('adminkey') })
})
.then(res => res.json())
.then(data => {
    let isAdmin = data.admin;

if (isAdmin) {
    createAdminPanel();
}

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
        <input placeholder="Project URL..." /><br/>
        <input placeholder="tagPrimary" /><br/>
        <input placeholder="tagSecondary" /><br/>
        <button>update</button>
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

});
