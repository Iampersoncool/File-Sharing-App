const a = document.querySelectorAll("a");

a.forEach((anchorElement) => {
  anchorElement.onclick = () => {
    return confirm("are you sure?");
  };
});
