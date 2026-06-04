// File#: _1_cursor-movement-effects
// Usage: codyhouse.co/license
(function () {
    var CursorFx = function (opts) {
        this.target = opts.target;
        this.objects = opts.objects;
        this.animating = false;
        this.animatingId = false;
        this.rotateValue = [];
        initCursorFx(this);
    };

    function initCursorFx(element) {
        // detect mouse move on card element
        element.target.addEventListener('mousemove', function (event) {
            if (element.animating) return;
            element.animating = true;
            element.animatingId = window.requestAnimationFrame(moveObjs.bind(element, event));
        });

        element.target.addEventListener('mouseleave', function (event) {
            // reset style
            if (element.animatingId) {
                window.cancelAnimationFrame(element.animatingId);
                element.animatingId = false;
                element.animating = false;
            }
            resetObjs(element);
        });
    };

    function moveObjs(event) {
        // update target size info
        this.targetInfo = this.target.getBoundingClientRect();
        for (var i = 0; i < this.objects.length; i++) {
            if (!this.rotateValue[i]) this.rotateValue[i] = false;
            moveSingleObj(this, this.objects[i], event, i);
        }
        this.animating = false;
    };

    function moveSingleObj(element, objDetails, event, index) {
        var effect = 'parallax';
        if (objDetails['effect']) effect = objDetails['effect'];

        if (effect == 'parallax') {
            moveObjParallax(element, objDetails, event);
        } else if (effect == 'follow') {
            moveObjFollow(element, objDetails, event);
        } else if (effect == 'rotate') {
            moveObjRotate(element, objDetails, event, index);
        }
    };

    function moveObjParallax(element, objDetails, event) {
        // get translateX and translateY values
        var deltaTranslate = parseInt(objDetails['delta']);
        var translateX = (2 * deltaTranslate / element.targetInfo.width) * (element.targetInfo.left + element.targetInfo.width / 2 - event.clientX);
        var translateY = (2 * deltaTranslate / element.targetInfo.height) * (element.targetInfo.top + element.targetInfo.height / 2 - event.clientY);
        // check if we need to change direction
        if (objDetails['direction'] && objDetails['direction'] == 'follow') {
            translateX = -1 * translateX;
            translateY = -1 * translateY;
        }

        objDetails.element.style.transform = 'translateX(' + translateX + 'px) translateY(' + translateY + 'px)';
    };

    function moveObjFollow(element, objDetails, event) {
        var objInfo = objDetails.element.getBoundingClientRect();
        objDetails.element.style.transform = 'translateX(' + parseInt(event.clientX - objInfo.width / 2) + 'px) translateY(' + parseInt(event.clientY - objInfo.height / 2) + 'px)';
    };

    function moveObjRotate(element, objDetails, event, index) {
        var boxBoundingRect = objDetails.element.getBoundingClientRect();
        var boxCenter = {
            x: boxBoundingRect.left + boxBoundingRect.width / 2,
            y: boxBoundingRect.top + boxBoundingRect.height / 2
        };

        var angle = Math.atan2(event.pageX - boxCenter.x, - (event.pageY - boxCenter.y)) * (180 / Math.PI);

        // if this is the first time the mouse enters the onject - this angle will be the delta rotation
        if (element.rotateValue[index] === false) {
            element.rotateValue[index] = angle;
        };

        angle = angle - element.rotateValue[index];
        objDetails.element.style.transform = 'rotate(' + angle + 'deg)';
    };

    function resetObjs(element) {
        for (var i = 0; i < element.objects.length; i++) {
            resetSingleObj(element, element.objects[i]);
            element.rotateValue[i] = false;
        }
    };

    function resetSingleObj(element, objDetails) {
        var effect = 'parallax';
        if (objDetails['effect']) effect = objDetails['effect'];

        if (effect == 'parallax' || effect == 'rotate') {
            objDetails.element.style.transform = '';
        }

    };

    window.CursorFx = CursorFx;
}());

(function () {
    // demo code - initialize the CursorFx element
    var cursorFx = document.getElementsByClassName('js-cursor-fx-target');
    if (cursorFx.length > 0) {
        var obj1 = document.getElementsByClassName('js-cursor-fx-object--1');
        var obj2 = document.getElementsByClassName('js-cursor-fx-object--2');
        var objects = [];
        if (obj1.length > 0) {
            objects.push({ element: obj1[0], effect: 'parallax', delta: '20' });
        }
        if (obj2.length > 0) {
            objects.push({ element: obj2[0], effect: 'parallax', delta: '10', direction: 'follow' });
        }

        new CursorFx({
            target: cursorFx[0],
            objects: objects
        });
    }
}());

(function () {
    var MorphBg = function (element) {
        this.element = element;
        this.wrapper = this.element.closest('.js-morph-bg-wrapper');
        this.elementId = this.element.getAttribute('id');
        this.targets = document.querySelectorAll('[data-morph-bg="' + this.elementId + '"]');
        this.bgTargets = [];
        this.action = this.element.getAttribute('data-morph-bg-event');
        this.targetIndex = false;
        this.defaultIndex = false;
        if (!this.action) this.action = 'click';
        initMorphBg(this);
    };

    function initMorphBg(element) {
        getBgTargets(element);
        setInitialState(element);
        if (element.action == 'click') {
            initClickEvent(element);
        } else {
            initHoverEvent(element);
        }

        window.addEventListener('update-morphbg', function () {
            morphBgResize(element);
        });
        window.addEventListener('hide-morphbg', function () {
            morphBgHide(element);
        })
    };

    function getBgTargets(element) {
        for (var i = 0; i < element.targets.length; i++) {
            var bgTarget = element.targets[i].querySelector('[data-morph-bg-target]') || element.targets[i];
            element.bgTargets.push(bgTarget);
        }
    };

    function setInitialState(element) {
        for (var i = 0; i < element.targets.length; i++) {
            if (element.targets[i].hasAttribute('data-morph-bg-active')) {
                setPosition(element, i);
                element.defaultIndex = i;
                break;
            }
        }
    };

    function initClickEvent(element) {
        for (var i = 0; i < element.targets.length; i++) {
            (function (i) {
                element.targets[i].addEventListener('click', function (event) {
                    setPosition(element, i);
                })
            })(i);
        }
    };

    function initHoverEvent(element) {
        for (var i = 0; i < element.targets.length; i++) {
            (function (i) {
                element.targets[i].addEventListener('mouseenter', function (event) {
                    setPosition(element, i);
                });
                element.targets[i].addEventListener('mouseleave', function (event) {
                    resetBgPosition(element, event);
                });
            })(i);
        }

        var preserveWrapper = element.targets[0].closest('[data-morph-bg-preserve]');
        if (preserveWrapper) {
            preserveWrapper.addEventListener('mouseleave', function (event) {
                resetBgPosition(element, event);
            });
        }
    };

    function setPosition(element, index) {
        var targetInfo = element.bgTargets[index].getBoundingClientRect(),
            targetRadius = getComputedStyle(element.bgTargets[index]).borderRadius;

        var wrapperInfo = element.wrapper.getBoundingClientRect();

        element.element.style.transform = 'translateX(' + (targetInfo.left - wrapperInfo.left) + 'px) translateY(' + (targetInfo.top - wrapperInfo.top) + 'px) translateZ(-0.1px)';
        element.element.style.height = targetInfo.height + 'px';
        element.element.style.width = targetInfo.width + 'px';
        element.element.style.borderRadius = targetRadius;

        element.element.classList.add('morph-bg--visible');
        setTimeout(function () {
            if (!element.element.classList.contains('morph-bg--has-transition')) element.element.classList.add('morph-bg--has-transition');
        }, 10);

        element.targetIndex = index;
    };

    function resetBgPosition(element, event) {
        if (event.relatedTarget.closest('[data-morph-bg="' + element.elementId + '"]') || event.relatedTarget.closest('[data-morph-bg-preserve]')) return;
        if (element.defaultIndex !== false) {
            element.targetIndex = element.defaultIndex;
            setPosition(element, element.targetIndex);
            return;
        }

        element.element.classList.remove('morph-bg--visible', 'morph-bg--has-transition');
        element.targetIndex = false;
    };

    function morphBgResize(element) {
        if (element.targetIndex === false) return;
        setPosition(element, element.targetIndex);
        element.element.style.display = '';
    };

    function morphBgHide(element) {
        element.element.style.display = 'none';
    };

    window.MorphBg = MorphBg;

    var morphBg = document.getElementsByClassName('js-morph-bg');
    if (morphBg.length > 0) {
        for (var i = 0; i < morphBg.length; i++) {
            (function (i) { new MorphBg(morphBg[i]) })(i);
        }
    }

    var resizingId = false,
        customEventMorph = new CustomEvent('update-morphbg'),
        customEventHide = new CustomEvent('hide-morphbg');

    window.addEventListener('resize', function () {
        if (!resizingId) doneResizing(customEventHide);
        clearTimeout(resizingId);
        resizingId = setTimeout(function () {
            doneResizing(customEventMorph);
            resizingId = false;
        }, 100);
    });

    if (document.fonts) {
        document.fonts.onloadingdone = function (fontFaceSetEvent) {
            doneResizing(customEventMorph);
        };

        document.fonts.ready.then(function () {
            setTimeout(function () {
                doneResizing(customEventMorph);
            }, 300);
        });
    }

    function doneResizing(customEvent) {
        window.dispatchEvent(customEvent);
    };
}());

(function () {
    var btn = document.querySelector('.js-split-btn-v2__btn');
    var wrapper = document.querySelector('.js-split-btn-v2__list-wrapper');
    if (!btn || !wrapper) return;

    var icon = btn.querySelector('.split-btn-v2__btn-icon');

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isExpanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isExpanded));
        wrapper.classList.toggle('is-visible', !isExpanded);

        if (icon) {
            icon.classList.remove('is-bouncing');
            void icon.offsetWidth; // reflow to restart animation
            icon.classList.add('is-bouncing');
            icon.addEventListener('animationend', function () {
                icon.classList.remove('is-bouncing');
            }, { once: true });
        }
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.split-btn-v2')) {
            btn.setAttribute('aria-expanded', 'false');
            wrapper.classList.remove('is-visible');
        }
    });
}());

(function () {
    var btns = document.querySelectorAll('.js-parallax-btn');
    if (!btns.length) return;

    btns.forEach(function (btn) {
        var img = btn.querySelector('.js-parallax-btn__bg-img');
        if (!img) return;

        btn.addEventListener('mousemove', function (e) {
            var rect = btn.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width - 0.5;
            var y = (e.clientY - rect.top) / rect.height - 0.5;
            img.style.transform = 'translate(' + (x * -20) + 'px, ' + (y * -20) + 'px) scale(1.2)';
        });

        btn.addEventListener('mouseleave', function () {
            img.style.transform = 'scale(1.2)';
        });
    });
}());

// utility functions
if (!Util) function Util() { };

Util.hasClass = function (el, className) {
    return el.classList.contains(className);
};

Util.addClass = function (el, className) {
    var classList = className.split(' ');
    el.classList.add(classList[0]);
    if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function (el, className) {
    var classList = className.split(' ');
    el.classList.remove(classList[0]);
    if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

// File#: _1_toast
// Usage: codyhouse.co/license
(function () {
    var Toasts = function () {
        this.toastsEl = document.getElementsByClassName('js-toast');
        this.toastsId = getRandomInt(0, 1000);
        this.index = 0;
        this.closingToast = false;
        initToasts(this);
    };

    // public method to initialize new toast elements
    Toasts.prototype.initToast = function (element) {
        initSingleToast(this, element);
    };

    function initToasts(obj) {
        // create a wrapper element for each toast variation
        createWrapper(obj, 'top-right');
        createWrapper(obj, 'top-left');
        createWrapper(obj, 'top-center');
        createWrapper(obj, 'bottom-right');
        createWrapper(obj, 'bottom-left');
        createWrapper(obj, 'bottom-center');

        // init single toast element
        for (var i = 0; i < obj.toastsEl.length; i++) {
            initSingleToast(obj, obj.toastsEl[i]);
        }

        // listen for dynamic toast creation
        window.addEventListener('newToast', function (event) {
            initSingleToast(obj, event.detail);
        });
    };

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    };

    function createWrapper(obj, position) {
        var classes = 'ta1-top-0 ta1-left-0 ta1-flex-column';
        if (position == 'top-right') classes = 'ta1-top-0 ta1-right-0 ta1-flex-column';
        if (position == 'top-center') classes = 'ta1-top-0 ta1-left-50% -ta1-translate-x-50% ta1-flex-column ta1-items-center';
        if (position == 'bottom-right') classes = 'ta1-bottom-0 ta1-right-0 ta1-flex-column-reverse';
        if (position == 'bottom-left') classes = 'ta1-bottom-0 ta1-left-0 ta1-flex-column-reverse';
        if (position == 'bottom-center') classes = 'ta1-bottom-0 ta1-left-50% -ta1-translate-x-50% ta1-flex-column-reverse ta1-items-center';

        var div = '<div class="toast-wrapper ta1-position-fixed ta1-flex ' + classes + '" id="toast-wrapper-' + position + '"></div>';
        document.body.insertAdjacentHTML('beforeend', div);
        obj[position] = document.getElementById('toast-wrapper-' + position);
    };

    function initSingleToast(obj, toast) {
        var id = 'toast-' + obj.toastsId + '-' + obj.index;
        obj.index = obj.index + 1;
        // store toast info in the Toasts obj
        obj[id] = {};
        obj[id]['interval'] = toast.getAttribute('data-toast-interval') || 5000,
            obj[id]['intervalId'] = false;
        obj[id]['closing'] = false;
        // get position type
        var classes = toast.getAttribute('class');
        obj[id]['position'] = 'top-right';
        if (classes.indexOf('toast--top-left') > -1) obj[id]['position'] = 'top-left';
        if (classes.indexOf('toast--top-center') > -1) obj[id]['position'] = 'top-center';
        if (classes.indexOf('toast--bottom-right') > -1) obj[id]['position'] = 'bottom-right';
        if (classes.indexOf('toast--bottom-left') > -1) obj[id]['position'] = 'bottom-left';
        if (classes.indexOf('toast--bottom-center') > -1) obj[id]['position'] = 'bottom-center';

        // listen for custom open event
        toast.addEventListener('openToast', function () {
            if (!Util.hasClass(toast, 'toast--hidden') || obj[id]['closing']) return;
            openToast(obj, toast, id);
        });

        // close toast
        toast.addEventListener('click', function (event) {
            if (event.target.closest('.js-toast__close-btn')) {
                obj.closingToast = true;
                closeToast(obj, toast, id);
            }
        });
    };

    function openToast(obj, toast, id) {
        if (obj[id]['intervalId']) {
            clearInterval(obj[id]['intervalId']);
            obj[id]['intervalId'] = false;
        }
        // place toast - insert in the proper container
        var fragment = document.createDocumentFragment();
        fragment.appendChild(toast);
        obj[obj[id]['position']].appendChild(fragment);

        // change position
        toast.style.position = 'static';

        // show toast
        setTimeout(function () {
            Util.removeClass(toast, 'toast--hidden');
        });

        // automatically close after a time interval
        if (obj[id]['interval'] && parseInt(obj[id]['interval']) > 0) {
            setToastInterval(obj, toast, id, obj[id]['interval']);
        }
    };

    function setToastInterval(obj, toast, id, interval) {
        obj[id]['intervalId'] = setTimeout(function () {
            if (obj.closingToast) return setToastInterval(obj, toast, id, 1000);
            closeToast(obj, toast, id);
        }, interval);
    };

    function closeToast(obj, toast, id) {
        obj[id]['closing'] = true;
        Util.addClass(toast, 'toast--hidden');
        // clear timeout
        if (obj[id]['intervalId']) clearTimeout(obj[id]['intervalId']);
        // remove toast and animate siblings
        closeToastAnimation(obj, toast, id);
    };

    function closeToastAnimation(obj, toast, id) {
        // get all next elements 
        var siblings = getToastNextSiblings(toast);
        // get translate value (could be positive or negative based on position)
        var toastStyle = window.getComputedStyle(toast),
            margin = parseInt(toastStyle.getPropertyValue('margin-top')) || parseInt(toastStyle.getPropertyValue('margin-bottom'));
        // translate next elements if any
        var translate = toast.offsetHeight + margin;
        if (obj[id]['position'].indexOf('top') > -1) {
            translate = '-' + translate
        }
        for (var i = 0; i < siblings.length; i++) {
            siblings[i].style.transform = 'translateY(' + translate + 'px)';
        }
        // remove toast and reset translate
        toast.addEventListener('transitionend', function cb(event) {
            if (event.propertyName != 'opacity') return;
            toast.removeEventListener('transitionend', cb);
            removeToast(toast, siblings, obj, id);
            obj.closingToast = false;
        });
    };

    function getToastNextSiblings(toast) {
        var array = [];
        var nextSibling = toast.nextElementSibling;
        if (nextSibling) {
            array.push(nextSibling);
            var nextSiblingsIterate = getToastNextSiblings(nextSibling);
            Array.prototype.push.apply(array, nextSiblingsIterate);
        }
        return array;
    };

    function removeToast(toast, siblings, obj, id) {
        // reset position
        toast.style.position = '';

        // move toast back to body
        var fragment = document.createDocumentFragment();
        fragment.appendChild(toast);
        document.body.appendChild(fragment);

        // reset siblings translate
        for (var i = 0; i < siblings.length; i++) {
            (function (i) {
                // set transition to none
                siblings[i].style.transition = 'none';
                siblings[i].style.transform = '';
                setTimeout(function () { siblings[i].style.transition = ''; }, 10);
            })(i);
        }

        // reset closing status
        obj[id]['closing'] = false;
    };

    window.Toasts = Toasts;

    //initialize the Toasts objects
    var toasts = document.getElementsByClassName('js-toast');
    if (toasts.length > 0) {
        new Toasts();
    }

    // wire up trigger buttons via aria-controls
    document.querySelectorAll('[aria-controls]').forEach(function (btn) {
        var target = document.getElementById(btn.getAttribute('aria-controls'));
        if (!target || !target.classList.contains('js-toast')) return;
        btn.addEventListener('click', function () {
            var clone = target.cloneNode(true);
            clone.removeAttribute('id');
            clone.classList.add('toast--hidden');
            document.body.appendChild(clone);
            window.dispatchEvent(new CustomEvent('newToast', { detail: clone }));
            clone.dispatchEvent(new CustomEvent('openToast'));
        });
    });
}());

// File#: _1_collapse
// Usage: codyhouse.co/license
(function () {
    var Collapse = function (element) {
        this.element = element;
        this.triggers = document.querySelectorAll('[aria-controls="' + this.element.getAttribute('id') + '"]');
        this.animate = this.element.getAttribute('data-collapse-animate') == 'on';
        this.animating = false;
        initCollapse(this);
    };

    function initCollapse(element) {
        if (element.triggers) {
            // set initial 'aria-expanded' attribute for trigger elements
            updateTriggers(element, !element.element.classList.contains('cj1-hide'));

            // detect click on trigger elements
            for (var i = 0; i < element.triggers.length; i++) {
                element.triggers[i].addEventListener('click', function (event) {
                    event.preventDefault();
                    toggleVisibility(element);
                });
            }
        }

        // custom event
        element.element.addEventListener('collapseToggle', function (event) {
            toggleVisibility(element);
        });
    };

    function toggleVisibility(element) {
        var bool = element.element.classList.contains('cj1-hide');
        if (element.animating) return;
        element.animating = true;
        animateElement(element, bool);
        updateTriggers(element, bool);
    };

    function animateElement(element, bool) {
        // bool === true -> show content
        if (!element.animate || !window.requestAnimationFrame) {
            element.element.classList.toggle('cj1-hide', !bool);
            element.animating = false;
            return;
        }

        // animate content height
        element.element.classList.remove('cj1-hide');
        var initHeight = !bool ? element.element.offsetHeight : 0,
            finalHeight = !bool ? 0 : element.element.offsetHeight;

        element.element.classList.add('cj1-overflow-hidden');

        setHeight(initHeight, finalHeight, element.element, 200, function () {
            if (!bool) element.element.classList.add('cj1-hide');
            element.element.removeAttribute("style");
            element.element.classList.remove('cj1-overflow-hidden');
            element.animating = false;
        }, 'easeInOutQuad');
    };

    function updateTriggers(element, bool) {
        for (var i = 0; i < element.triggers.length; i++) {
            bool ? element.triggers[i].setAttribute('aria-expanded', 'true') : element.triggers[i].removeAttribute('aria-expanded');
        };
    };

    function setHeight(start, to, element, duration, cb, timeFunction) {
        var change = to - start,
            currentTime = null;

        var animateHeight = function (timestamp) {
            if (!currentTime) currentTime = timestamp;
            var progress = timestamp - currentTime;
            if (progress > duration) progress = duration;
            var val = parseInt((progress / duration) * change + start);
            if (timeFunction) {
                val = Math.easeInOutQuart(progress, start, to - start, duration);
            }
            element.style.height = val + "px";
            if (progress < duration) {
                window.requestAnimationFrame(animateHeight);
            } else {
                if (cb) cb();
            }
        };

        //set the height of the element before starting animation -> fix bug on Safari
        element.style.height = start + "px";
        window.requestAnimationFrame(animateHeight);
    };

    // Animation curve
    Math.easeInOutQuart = function (t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t * t + b;
        t -= 2;
        return -c / 2 * (t * t * t * t - 2) + b;
    };

    window.Collapse = Collapse;

    //initialize the Collapse objects
    var collapses = document.getElementsByClassName('js-collapse');
    if (collapses.length > 0) {
        for (var i = 0; i < collapses.length; i++) {
            new Collapse(collapses[i]);
        }
    }
}());

// File#: _1_alert-card
// Usage: codyhouse.co/license
(function () {
    function initAlertCard(card) {
        card.addEventListener('click', function (event) {
            if (event.target.closest('.js-alert-card__close-btn')) card.classList.add('cd-hide');
        });
    };

    var alertCards = document.getElementsByClassName('js-alert-card');
    if (alertCards.length > 0) {
        for (var i = 0; i < alertCards.length; i++) {
            (function (i) { initAlertCard(alertCards[i]) })(i);
        }
    }
}());

// File#: _1_color-swatches
// Usage: codyhouse.co/license
(function () {
    var ColorSwatches = function (element) {
        this.element = element;
        this.select = false;
        initCustomSelect(this); // replace <select> with custom <ul> list
        this.list = this.element.getElementsByClassName('js-color-swatches__list')[0];
        this.swatches = this.list.getElementsByClassName('js-color-swatches__option');
        this.labels = this.list.getElementsByClassName('js-color-swatch__label');
        this.selectedLabel = this.element.getElementsByClassName('js-color-swatches__color');
        this.focusOutId = false;
        initColorSwatches(this);
    };

    function initCustomSelect(element) {
        var select = element.element.getElementsByClassName('js-color-swatches__select');
        if (select.length == 0) return;
        element.select = select[0];
        var customContent = '';
        for (var i = 0; i < element.select.options.length; i++) {
            var ariaChecked = i == element.select.selectedIndex ? 'true' : 'false',
                customClass = i == element.select.selectedIndex ? ' color-swatches__item--selected' : '',
                customAttributes = getSwatchCustomAttr(element.select.options[i]);
            customContent = customContent + '<li class="color-swatches__item js-color-swatches__item' + customClass + '" role="radio" aria-checked="' + ariaChecked + '" data-value="' + element.select.options[i].value + '"><span class="js-color-swatches__option js-tab-focus" tabindex="0"' + customAttributes + '><span class="cc9-sr-only js-color-swatch__label">' + element.select.options[i].text + '</span><span aria-hidden="true" style="' + element.select.options[i].getAttribute('data-style') + '" class="color-swatches__swatch"></span></span></li>';
        }

        var list = document.createElement("ul");
        list.setAttribute('class', 'color-swatches__list js-color-swatches__list');
        list.setAttribute('role', 'radiogroup');

        list.innerHTML = customContent;
        element.element.insertBefore(list, element.select);
        element.select.classList.add('cc9-hide');
    };

    function initColorSwatches(element) {
        // detect focusin/focusout event - update selected color label
        element.list.addEventListener('focusin', function (event) {
            if (element.focusOutId) clearTimeout(element.focusOutId);
            updateSelectedLabel(element, document.activeElement);
        });
        element.list.addEventListener('focusout', function (event) {
            element.focusOutId = setTimeout(function () {
                resetSelectedLabel(element);
            }, 200);
        });

        // mouse move events
        for (var i = 0; i < element.swatches.length; i++) {
            handleHoverEvents(element, i);
        }

        // --select variation only
        if (element.select) {
            // click event - select new option
            element.list.addEventListener('click', function (event) {
                // update selected option
                resetSelectedOption(element, event.target);
            });

            // space key - select new option
            element.list.addEventListener('keydown', function (event) {
                if ((event.keyCode && event.keyCode == 32 || event.key && event.key == ' ') || (event.keyCode && event.keyCode == 13 || event.key && event.key.toLowerCase() == 'enter')) {
                    // update selected option
                    resetSelectedOption(element, event.target);
                }
            });
        }
    };

    function handleHoverEvents(element, index) {
        element.swatches[index].addEventListener('mouseenter', function (event) {
            updateSelectedLabel(element, element.swatches[index]);
        });
        element.swatches[index].addEventListener('mouseleave', function (event) {
            resetSelectedLabel(element);
        });
    };

    function resetSelectedOption(element, target) { // for --select variation only - new option selected
        var option = target.closest('.js-color-swatches__item');
        if (!option) return;
        var selectedSwatch = element.list.querySelector('.color-swatches__item--selected');
        if (selectedSwatch) {
            selectedSwatch.classList.remove('color-swatches__item--selected');
            selectedSwatch.setAttribute('aria-checked', 'false');
        }
        option.classList.add('color-swatches__item--selected');
        option.setAttribute('aria-checked', 'true');
        // update select element
        updateNativeSelect(element.select, option.getAttribute('data-value'));
    };

    function resetSelectedLabel(element) {
        var selectedSwatch = element.list.getElementsByClassName('color-swatches__item--selected');
        if (selectedSwatch.length > 0) updateSelectedLabel(element, selectedSwatch[0]);
    };

    function updateSelectedLabel(element, swatch) {
        var newLabel = swatch.getElementsByClassName('js-color-swatch__label');
        if (newLabel.length == 0) return;
        element.selectedLabel[0].textContent = newLabel[0].textContent;
    };

    function updateNativeSelect(select, value) {
        for (var i = 0; i < select.options.length; i++) {
            if (select.options[i].value == value) {
                select.selectedIndex = i; // set new value
                select.dispatchEvent(new CustomEvent('change')); // trigger change event
                break;
            }
        }
    };

    function getSwatchCustomAttr(swatch) {
        var customAttrArray = swatch.getAttribute('data-custom-attr');
        if (!customAttrArray) return '';
        var customAttr = ' ',
            list = customAttrArray.split(',');
        for (var i = 0; i < list.length; i++) {
            var attr = list[i].split(':')
            customAttr = customAttr + attr[0].trim() + '="' + attr[1].trim() + '" ';
        }
        return customAttr;
    };

    //initialize the ColorSwatches objects
    var swatches = document.getElementsByClassName('js-color-swatches');
    if (swatches.length > 0) {
        for (var i = 0; i < swatches.length; i++) {
            new ColorSwatches(swatches[i]);
        }
    }
}());

// utility functions
if (!Util) function Util() { };

Util.osHasReducedMotion = function () {
    if (!window.matchMedia) return false;
    var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (matchMediaObj) return matchMediaObj.matches;
    return false;
};

// File#: _1_stacking-cards
// Usage: codyhouse.co/license
(function () {
    var StackCards = function (element) {
        this.element = element;
        this.items = this.element.getElementsByClassName('js-stack-cards__item');
        this.scrollingFn = false;
        this.scrolling = false;
        initStackCardsEffect(this);
        initStackCardsResize(this);
    };

    function initStackCardsEffect(element) { // use Intersection Observer to trigger animation
        setStackCards(element); // store cards CSS properties
        var observer = new IntersectionObserver(stackCardsCallback.bind(element), { threshold: [0, 1] });
        observer.observe(element.element);
    };

    function initStackCardsResize(element) { // detect resize to reset gallery
        element.element.addEventListener('resize-stack-cards', function () {
            setStackCards(element);
            animateStackCards.bind(element);
        });
    };

    function stackCardsCallback(entries) { // Intersection Observer callback
        if (entries[0].isIntersecting) {
            if (this.scrollingFn) return; // listener for scroll event already added
            stackCardsInitEvent(this);
        } else {
            if (!this.scrollingFn) return; // listener for scroll event already removed
            window.removeEventListener('scroll', this.scrollingFn);
            this.scrollingFn = false;
        }
    };

    function stackCardsInitEvent(element) {
        element.scrollingFn = stackCardsScrolling.bind(element);
        window.addEventListener('scroll', element.scrollingFn);
    };

    function stackCardsScrolling() {
        if (this.scrolling) return;
        this.scrolling = true;
        window.requestAnimationFrame(animateStackCards.bind(this));
    };

    function setStackCards(element) {
        // store wrapper properties
        element.marginY = getComputedStyle(element.element).getPropertyValue('--stack-cards-gap');
        getIntegerFromProperty(element); // convert element.marginY to integer (px value)
        element.elementHeight = element.element.offsetHeight;

        // store card properties
        var cardStyle = getComputedStyle(element.items[0]);
        element.cardTop = Math.floor(parseFloat(cardStyle.getPropertyValue('top')));
        element.cardHeight = Math.floor(parseFloat(cardStyle.getPropertyValue('height')));

        // store window property
        element.windowHeight = window.innerHeight;

        // reset margin + translate values
        if (isNaN(element.marginY)) {
            element.element.style.paddingBottom = '0px';
        } else {
            element.element.style.paddingBottom = (element.marginY * (element.items.length - 1)) + 'px';
        }

        for (var i = 0; i < element.items.length; i++) {
            if (isNaN(element.marginY)) {
                element.items[i].style.transform = 'none;';
            } else {
                element.items[i].style.transform = 'translateY(' + element.marginY * i + 'px)';
            }
        }
    };

    function getIntegerFromProperty(element) {
        var node = document.createElement('div');
        node.setAttribute('style', 'opacity:0; visbility: hidden;position: absolute; height:' + element.marginY);
        element.element.appendChild(node);
        element.marginY = parseInt(getComputedStyle(node).getPropertyValue('height'));
        element.element.removeChild(node);
    };

    function animateStackCards() {
        if (isNaN(this.marginY)) { // --stack-cards-gap not defined - do not trigger the effect
            this.scrolling = false;
            return;
        }

        var top = this.element.getBoundingClientRect().top;

        if (this.cardTop - top + this.element.windowHeight - this.elementHeight - this.cardHeight + this.marginY + this.marginY * this.items.length > 0) {
            this.scrolling = false;
            return;
        }

        for (var i = 0; i < this.items.length; i++) { // use only scale
            var scrolling = this.cardTop - top - i * (this.cardHeight + this.marginY);
            if (scrolling > 0) {
                var scaling = i == this.items.length - 1 ? 1 : (this.cardHeight - scrolling * 0.05) / this.cardHeight;
                this.items[i].style.transform = 'translateY(' + this.marginY * i + 'px) scale(' + scaling + ')';
            } else {
                this.items[i].style.transform = 'translateY(' + this.marginY * i + 'px)';
            }
        }

        this.scrolling = false;
    };

    // initialize StackCards object
    var stackCards = document.getElementsByClassName('js-stack-cards'),
        intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
        reducedMotion = Util.osHasReducedMotion();

    if (stackCards.length > 0 && intersectionObserverSupported && !reducedMotion) {
        var stackCardsArray = [];
        for (var i = 0; i < stackCards.length; i++) {
            (function (i) {
                stackCardsArray.push(new StackCards(stackCards[i]));
            })(i);
        }

        var resizingId = false,
            customEvent = new CustomEvent('resize-stack-cards');

        window.addEventListener('resize', function () {
            clearTimeout(resizingId);
            resizingId = setTimeout(doneResizing, 500);
        });

        function doneResizing() {
            for (var i = 0; i < stackCardsArray.length; i++) {
                (function (i) { stackCardsArray[i].element.dispatchEvent(customEvent) })(i);
            };
        };
    }
}());

// utility functions
if (!Util) function Util() { };

Util.hasClass = function (el, className) {
    return el.classList.contains(className);
};

Util.addClass = function (el, className) {
    var classList = className.split(' ');
    el.classList.add(classList[0]);
    if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function (el, className) {
    var classList = className.split(' ');
    el.classList.remove(classList[0]);
    if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function (el, className, bool) {
    if (bool) Util.addClass(el, className);
    else Util.removeClass(el, className);
};

// File#: _1_side-navigation
// Usage: codyhouse.co/license
(function () {
    function initSideNav(nav) {
        nav.addEventListener('click', function (event) {
            var btn = event.target.closest('.js-sidenav__sublist-control');
            if (!btn) return;
            var listItem = btn.parentElement,
                bool = Util.hasClass(listItem, 'sidenav__item--expanded');
            btn.setAttribute('aria-expanded', !bool);
            Util.toggleClass(listItem, 'sidenav__item--expanded', !bool);
        });
    };

    var sideNavs = document.getElementsByClassName('js-sidenav');
    if (sideNavs.length > 0) {
        for (var i = 0; i < sideNavs.length; i++) {
            (function (i) { initSideNav(sideNavs[i]); })(i);
        }
    }
}());