document.addEventListener("DOMContentLoaded", function() {
  const track = document.querySelector('.skills-track');
  const skills = track.children;
  const totalSkills = skills.length;

  // Clone the items for continuous loop
  for (let i = 0; i < totalSkills; i++) {
    let clone = skills[i].cloneNode(true);
    track.appendChild(clone);
  }
});
