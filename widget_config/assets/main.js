(function () {

    function getWidgetUrl() {
        var url = new URLSearchParams(location.search).get("widget_url");
        return url || "https://developer.kyber.network/widget/payment";

    }

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    function grabForm() {
        var form = document.querySelector(".params");
        var data = [], error = [], msg, name, value;
        form.querySelectorAll("input, select").forEach(function (node) {
            // do simple validation
            name = node.getAttribute("name");
            if (!node.checkValidity()) {
                msg = node.getAttribute("message") || ("Invalid input for: " + name);
                node.setAttribute("title", msg);
                error.push(msg);
                return;
            } else {
                node.removeAttribute("title");
            }

            // set name - value
            if (node.type && node.type === 'checkbox') {
                value = node.checked.toString();
            } else {
                value = node.value;
            }

            if (name && value) {
                if (name != "extraParams") {
                    data.push(name + "=" + encodeURIComponent(value));
                } else {
                    data.push(value);
                }
            }
        });

        return {
            error: error,
            data: data.join("&")
        }
    }

    function copyClipboard(selector) {
        var input = document.querySelector(selector); // input, textarea
        input.removeAttribute("disabled");
        input.select();

        var result = document.execCommand("copy", true);
        input.setAttribute("disabled", "disabled");

        return result;
    }

    function wireEvents() {
        var form = document.querySelector("form");
        form.querySelectorAll("input, select").forEach(function (node) {
            node.addEventListener('change', generateTag);
            node.addEventListener('keyup', generateTag);
            node.addEventListener('paste', function () {
                setTimeout(generateTag, 0);
            });
        });

        document.querySelectorAll(".btn-copy").forEach(function (btn){
            btn.addEventListener('click', function(){
                if (!copyClipboard(this.getAttribute("data-copy-target"))) {
                    alert("Copy failed. Please use browser's copy feature instead.");
                }
            })
        });
    }

    function runTemplateJS(baseUrl) {
        var js = document.getElementById("widget_js").innerHTML.trim().replace("${baseUrl}", baseUrl);

        var script = document.createElement("script");
        script.innerHTML = js;
        document.getElementsByTagName('body')[0].appendChild(script);

        return js;
    }

    var generateTag = debounce(function () {
        var formData = grabForm();
        if (formData.error && formData.error.length) {
            document.getElementById("widget").innerHTML = "<p class='error'>" +
                formData.error.join("<br>") + "</p>";
            document.getElementById("sourceHtml").value = "";
            document.getElementById("sourceCss").value = "";
            return;
        }

        var isPopup = document.getElementById("typePopup").checked;

        var widgetBaseUrl = getWidgetUrl();
        var url = widgetBaseUrl + "?" + formData.data;
        var tagHtml = "<a href='" + url + "' class='kyber-widget-button'\n";
        tagHtml += "name='KyberPay - Powered by KyberNetwork' title='Pay by tokens'\n";
        tagHtml += "target='_blank'>Pay by tokens</a>";

        document.getElementById("widget").innerHTML = tagHtml;
        document.getElementById("sourceHtml").value = tagHtml;
        document.getElementById("sourceCss").value = document.getElementById("widget_button_style").innerHTML.trim();

        if (isPopup) {
            document.getElementById("sourceJs").value = runTemplateJS(widgetBaseUrl);
            document.getElementById("sourceCss").value += "\n" + document.getElementById("widget_popup_style").innerHTML.trim();
        } else {
            document.getElementById("sourceJs").value = "";
        }
    }, 50, false);


    generateTag();
    wireEvents();

})();
