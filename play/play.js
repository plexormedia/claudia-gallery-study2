/* Shared by the playgrounds: the header's Menu button, the same two lines as site.js L15–L16. */
(() => {
  const mb = document.querySelector(".menu-b"), nav = document.querySelector(".nav");
  if (mb && nav) mb.addEventListener("click", () => { const o = nav.classList.toggle("open"); mb.setAttribute("aria-expanded", o); });
})();
