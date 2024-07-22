document.getElementById("chooseButton").addEventListener("click", choosePerson);

document.getElementById("resetButton").addEventListener("click", resetApp);

let selectedNames = [];

function choosePerson() {
  const namesInput = document.getElementById("namesInput");

  namesInput.disabled = true;

  let names = namesInput.value
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name !== "");

  if (names.length === 0) {
    alert("Please enter at least one name.");

    namesInput.disabled = false;

    return;
  }

  if (selectedNames.length >= names.length) {
    alert("All names have been selected.");

    return;
  }

  names = names.filter((name) => !selectedNames.includes(name));

  if (names.length === 0) {
    alert("No more names to choose from.");

    namesInput.disabled = false;

    return;
  }

  let index = 0;

  const totalSpins = 30;

  const interval = setInterval(() => {
    if (index >= totalSpins) {
      clearInterval(interval);

      const selectedName = names[Math.floor(Math.random() * names.length)];

      selectedNames.push(selectedName);

      document.getElementById("selectedName").textContent = selectedName;

      animateSelection(selectedName);

      startConfetti();

      return;
    }

    document.getElementById("animationArea").textContent =
      names[index % names.length];

    index++;
  }, 100);
}

function animateSelection(name) {
  const selectedNameDiv = document.getElementById("selectedName");

  selectedNameDiv.classList.add("highlight");

  setTimeout(() => {
    selectedNameDiv.classList.remove("highlight");
  }, 500);
}

function resetApp() {
  const namesInput = document.getElementById("namesInput");

  namesInput.value = "";

  namesInput.disabled = false;

  document.getElementById("animationArea").textContent = "";

  document.getElementById("selectedName").textContent = "";

  selectedNames = [];
}

function startConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const confetti = [];
  const colors = ["#FF0A47", "#FF8C00", "#FFD700", "#00BFFF", "#32CD32"];

  let doAnimation = true;

  setTimeout(() => {
    doAnimation = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 5000);


  for (let i = 0; i < 100; i++) {
    confetti.push({
      x: Math.random() * canvas.width,

      y: Math.random() * canvas.height,

      r: Math.random() * 6 + 4,

      d: Math.random() * 5 + 2,

      color: colors[Math.floor(Math.random() * colors.length)],

      tilt: Math.random() * 10 - 10,

      tiltAngle: Math.random() * 2 * Math.PI,

      tiltAngleIncrement: Math.random() * 0.07 + 0.05,
    });
  }

  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < confetti.length; i++) {
      const c = confetti[i];

      ctx.beginPath();

      ctx.lineWidth = c.r / 2;

      ctx.strokeStyle = c.color;

      ctx.moveTo(c.x + c.tilt + c.r / 4, c.y);

      ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 4);

      ctx.stroke();
    }

    updateConfetti();
  }

  function updateConfetti() {
    for (let i = 0; i < confetti.length; i++) {
      const c = confetti[i];

      c.tiltAngle += c.tiltAngleIncrement;

      c.y += (Math.cos(c.tiltAngle) + 3 + c.r / 2) / 2;

      c.tilt = Math.sin(c.tiltAngle) * 15;

      if (c.y > canvas.height) {
        c.x = Math.random() * canvas.width;

        c.y = -10;

        c.tilt = Math.sin(c.tiltAngle) * 15;
      }
    }
  }

  function animateConfetti() {
    if (!doAnimation) {
        return;
    }

    drawConfetti();
    requestAnimationFrame(animateConfetti);
  }

  animateConfetti();
  setTimeout(() => {
    cancelAnimationFrame(animateConfetti);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 5000);
}
