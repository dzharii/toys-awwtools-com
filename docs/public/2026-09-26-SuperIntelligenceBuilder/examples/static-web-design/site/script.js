(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const checker = document.querySelector("#fit-checker");
  const itemKind = document.querySelector("#item-kind");
  const result = document.querySelector("#fit-result");

  const answers = {
    lamp: {
      stamp: "YES",
      title: "A lamp is a likely fit.",
      detail: "Bring its bulb, shade hardware, and power cord if they are part of the problem."
    },
    toy: {
      stamp: "YES",
      title: "A toy is a likely fit.",
      detail: "Bring loose pieces and remove leaking batteries before the visit."
    },
    clothing: {
      stamp: "YES",
      title: "Clothing is a likely fit.",
      detail: "Please bring it clean, plus any matching button, patch, or thread you already have."
    },
    appliance: {
      stamp: "ASK",
      title: "A small appliance may fit.",
      detail: "It should be clean, carryable, and free of fuel or pressure. A volunteer will assess it first."
    },
    other: {
      stamp: "ASK",
      title: "We could not match that item.",
      detail: "Email before carrying it over so the team can check the tools, skills, and safety needs."
    }
  };

  if (checker && itemKind && result) {
    checker.addEventListener("submit", function (event) {
      event.preventDefault();
      const answer = answers[itemKind.value];
      const stamp = result.querySelector(".fit-result__stamp");
      const copy = result.querySelector("p");

      if (!answer) {
        result.dataset.state = "caution";
        stamp.textContent = "?";
        copy.innerHTML = "<strong>Choose a type first.</strong><br>Select the closest match, or read the complete guidance below.";
        itemKind.focus();
        return;
      }

      result.dataset.state = answer.stamp === "YES" ? "likely" : "caution";
      stamp.textContent = answer.stamp;
      copy.replaceChildren();

      const title = document.createElement("strong");
      title.textContent = answer.title;
      copy.append(title, document.createElement("br"), answer.detail);
    });
  }

  const packingList = document.querySelector("#packing-list");
  const resetList = document.querySelector("#reset-list");
  const storageKey = "juniper-repair-packing-list";

  if (packingList && resetList) {
    const boxes = Array.from(packingList.querySelectorAll('input[type="checkbox"]'));
    resetList.hidden = false;

    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "[]");
      boxes.forEach(function (box) {
        box.checked = saved.includes(box.name);
      });
    } catch (error) {
      // Storage is optional. Native checkboxes still work when it is unavailable.
    }

    packingList.addEventListener("change", function () {
      const checked = boxes.filter(function (box) {
        return box.checked;
      }).map(function (box) {
        return box.name;
      });

      try {
        sessionStorage.setItem(storageKey, JSON.stringify(checked));
      } catch (error) {
        // Keep the interaction usable even if storage is blocked.
      }
    });

    resetList.addEventListener("click", function () {
      boxes.forEach(function (box) {
        box.checked = false;
      });

      try {
        sessionStorage.removeItem(storageKey);
      } catch (error) {
        // The visible reset is complete even if storage is blocked.
      }

      boxes[0].focus();
    });
  }
}());
