/* minicaptcha embed v1 — drop-in iframe widget
 * <script src="https://your-host/embed.js" defer></script>
 * <div data-minicaptcha data-sitekey="demo"></div>
 */
(function () {
  var script = document.currentScript
  if (!script) {
    var all = document.getElementsByTagName('script')
    script = all[all.length - 1]
  }
  if (!script || !script.src) return

  var BASE = script.src.replace(/\/?embed\.js(\?.*)?$/, '/')
  var ORIGIN = BASE.replace(/\/$/, '')
  var WIDTH = 320
  var HEIGHT = 62

  function mount(container) {
    if (!container || container.getAttribute('data-mc-mounted')) return
    container.setAttribute('data-mc-mounted', 'true')

    var sitekey = container.getAttribute('data-sitekey') || 'demo'
    var puzzle = container.getAttribute('data-puzzle') || ''
    var callbackName = container.getAttribute('data-callback') || ''

    var iframe = document.createElement('iframe')
    var src =
      BASE +
      'widget?sitekey=' +
      encodeURIComponent(sitekey) +
      '&host=' +
      encodeURIComponent(location.origin)
    if (puzzle) src += '&puzzle=' + encodeURIComponent(puzzle)
    iframe.src = src
    iframe.title = 'minicaptcha challenge'
    iframe.setAttribute('scrolling', 'no')
    iframe.setAttribute('frameborder', '0')
    iframe.style.width = WIDTH + 'px'
    iframe.style.height = HEIGHT + 'px'
    iframe.style.border = '0'
    iframe.style.display = 'block'
    iframe.style.colorScheme = 'light'
    container.appendChild(iframe)

    function writeToken(token) {
      container.setAttribute('data-token', token)
      var form = container.closest ? container.closest('form') : null
      if (form) {
        var input = form.querySelector('input[name="minicaptcha-token"]')
        if (!input) {
          input = document.createElement('input')
          input.type = 'hidden'
          input.name = 'minicaptcha-token'
          form.appendChild(input)
        }
        input.value = token
      }
      try {
        container.dispatchEvent(
          new CustomEvent('minicaptcha:verified', { detail: { token: token }, bubbles: true }),
        )
      } catch (err) {
        /* no CustomEvent support */
      }
      if (callbackName && typeof window[callbackName] === 'function') {
        try {
          window[callbackName](token)
        } catch (err) {
          /* callback threw */
        }
      }
    }

    function onMessage(event) {
      if (event.origin !== ORIGIN) return
      if (!event.data || event.data.source !== 'minicaptcha-widget') return
      if (event.source !== iframe.contentWindow) return

      var data = event.data
      if (data.type === 'resize' && typeof data.height === 'number') {
        iframe.style.height = Math.max(HEIGHT, Math.min(760, Math.round(data.height))) + 'px'
      } else if (data.type === 'success' && typeof data.token === 'string') {
        writeToken(data.token)
      }
    }

    window.addEventListener('message', onMessage)

    container.minicaptchaReset = function () {
      var el = container.querySelector('input[name="minicaptcha-token"]')
      if (el) el.value = ''
      container.removeAttribute('data-token')
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ source: 'minicaptcha-host', type: 'reset' }, ORIGIN)
      }
    }
  }

  function scan() {
    var nodes = document.querySelectorAll('[data-minicaptcha]')
    for (var i = 0; i < nodes.length; i++) mount(nodes[i])
  }

  function boot() {
    scan()
    if (window.MutationObserver && document.body) {
      new MutationObserver(function () {
        scan()
      }).observe(document.body, { childList: true, subtree: true })
    }
  }

  window.minicaptcha = {
    reset: function (target) {
      var nodes = target
        ? [target]
        : Array.prototype.slice.call(document.querySelectorAll('[data-minicaptcha]'))
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i] && typeof nodes[i].minicaptchaReset === 'function') nodes[i].minicaptchaReset()
      }
    },
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
