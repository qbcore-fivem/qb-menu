let images = []

const openMenu = (data = null) => {
  let html = ""
  let titleHtml = ""
  let startIndex = 0

  if (data[0] && data[0].isMenuTitle) {
    titleHtml = `<div class=\"menu-title\">${data[0].header}</div>`
    startIndex = 1
    $("#menuTitle").show()
  } else {
    $("#menuTitle").hide()
  }

  $("#menuTitle").html(titleHtml)

  for (let i = startIndex; i < data.length; i++) {
    const item = data[i]
    if (!item.hidden) {
      const header = item.header
      const message = item.txt || item.text
      const isMenuHeader = item.isMenuHeader
      const isDisabled = item.disabled
      const icon = item.icon
      images[i] = item
      html += getButtonRender(header, message, i, isMenuHeader, isDisabled, icon)
    }
  }

  $("#buttons").html(html)

  $(".button").click(function () {
    const target = $(this)
    if (!target.hasClass("title") && !target.hasClass("disabled")) {
      const audio = new Audio("./audio/press.wav");
      audio.volume = 0.7;
      audio.play();
      postData(target.attr("id"))
    }
  })
}

// so nobody can inject weird stuff into the menu.
// I know it's basic, but it does the job
function escapeHtml(text) {
  // If it's not a string, just return it as-is.
  if (typeof text !== 'string') return text;
  // Replace all the usual suspects with their HTML entities.
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const getButtonRender = (header, message = null, id, isMenuHeader, isDisabled, icon) => {
  const safeHeader = escapeHtml(header);
  const safeMessage = message ? escapeHtml(message) : null;
  return `
    <div class="${isMenuHeader ? "title" : "button"} ${isDisabled ? "disabled" : ""}" id="${id}">
      <div class="icon"> <img src=${icon} width=30px onerror="this.onerror=null; this.remove();"> <i class="${icon}" onerror="this.onerror=null; this.remove();"></i> </div>
      <div class="column">
      <div class="header"> ${safeHeader}</div>
      ${safeMessage ? `<div class="text">${safeMessage}</div>` : ""}
      </div>
    </div>
  `
}

const closeMenu = () => {
  $("#menuTitle").html("").hide()
  $("#buttons").html(" ")
  $("#imageHover").css("display", "none")
  images = []
}

const postData = (id) => {
  $.post(`https://${GetParentResourceName()}/clickedButton`, JSON.stringify(Number.parseInt(id) + 1))
  return closeMenu()
}

const cancelMenu = () => {
  $.post(`https://${GetParentResourceName()}/closeMenu`)
  return closeMenu()
}

window.addEventListener("message", (event) => {
  const data = event.data
  const buttons = data.data
  const action = data.action
  switch (action) {
    case "OPEN_MENU":
    case "SHOW_HEADER":
      return openMenu(buttons)
    case "CLOSE_MENU":
      return closeMenu()
    default:
      return
  }
})

window.addEventListener("mousemove", (event) => {
  const $target = $(event.target)
  if ($target.closest(".button:hover").length && $(".button").is(":visible")) {
    const id = event.target.id
    if (!images[id]) return
    if (images[id].image) {
      $("#image").attr("src", images[id].image)
      $("#imageHover").css("display", "block")
    }
  } else {
    $("#imageHover").css("display", "none")
  }
})

document.onkeyup = (event) => {
  const charCode = event.key
  if (charCode == "Escape") {
    cancelMenu()
  }
}
