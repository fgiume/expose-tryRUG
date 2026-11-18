/* EXPOSE contact form: client-side validation only.
 * Delivery and the acknowledgement email are handled by FormSubmit.
 * The inbox owner must activate the form using the email from FormSubmit.
 */
(function () {
  "use strict";
  var form = document.getElementById("contact-form");
  if (!form) return;
  var msg = form.elements["message"];
  var counter = document.getElementById("counter");
  var MAX = 1500;
  var submit = form.querySelector('button[type="submit"]');
  var next = document.getElementById("contact-next");
  // The form backend requires a full absolute redirect URL.
  if (next && /^https?:$/.test(location.protocol)) {
    next.value = new URL("thanks.html", location.href).href;
  }

  msg.addEventListener("input", function () {
    counter.textContent = msg.value.length + " / " + MAX;
  });
  function setInvalid(name, bad) {
    var input = form.elements[name];
    var field = input.closest(".field");
    field.classList.toggle("invalid", bad);
    input.setAttribute("aria-invalid", bad ? "true" : "false");
    return bad;
  }
  function validate() {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var bad = [
      setInvalid("name", form.elements["name"].value.trim().length < 2),
      setInvalid("email", !emailRe.test(form.elements["email"].value.trim())),
      setInvalid("topic", !form.elements["topic"].value),
      setInvalid("message", msg.value.trim().length < 10 || msg.value.length > MAX),
      setInvalid("consent", !form.elements["consent"].checked)
    ];
    return bad.indexOf(true) === -1;
  }

  form.addEventListener("submit", function (event) {
    if (form.elements["_honey"].value) {
      event.preventDefault();
      return;
    }
    if (!validate()) {
      event.preventDefault();
      var first = form.querySelector(".invalid input, .invalid select, .invalid textarea");
      if (first) first.focus();
      return;
    }
    if (submit) { submit.disabled = true; submit.textContent = "Submitting…"; }
    // Allow the browser to POST the form to the delivery provider.
    // Do not display a success message until the provider accepts it.
  });
})();
