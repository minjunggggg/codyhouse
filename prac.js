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