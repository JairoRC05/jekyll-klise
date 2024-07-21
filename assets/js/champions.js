console.clear()

document.addEventListener('DOMContentLoaded', (event) => {
    const navLinks = document.querySelectorAll('.nav-link');
    const items = document.querySelectorAll('.item');
    const sectionsWrap = document.getElementById('sections');
    const sections = document.querySelectorAll('.section');
    const goals = new Set();
    let activeItem = null, score = 0, delay = 0.1;
    document.getElementById('scoreVal').textContent = score + "/18";

    const updateActiveLink = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = [...sections].indexOf(entry.target);
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    link.blur();
                    link.removeAttribute('active');
                });
                if (navLinks[index]) {
                    navLinks[index].classList.add('active');
                    navLinks[index].setAttribute('active', '');
                    navLinks[index].focus();
                }
            }
        });
    };

    const observer = new IntersectionObserver(updateActiveLink, {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    });

    sections.forEach(section => observer.observe(section));

    navLinks.forEach((link, idx) => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            sections[idx].scrollIntoView({ behavior: 'smooth' });
            navLinks.forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('active');
            });
            this.classList.add('active');
            this.setAttribute('active', '');
        });
    });

    items.forEach(item => {
        let trigger = item.querySelector('.item-trigger');
        trigger.addEventListener('click', (e) => {
            if (!goals.has(trigger)) {
                score++;
                goals.add(trigger);
                document.getElementById('scoreVal').textContent = score + "/18";
                item.setAttribute('data-scored', 'true');
            }
            if (activeItem === item) {
                activeItem.classList.remove('active');
                activeItem = null;
                trigger.blur();
            } else {
                if (activeItem) {
                    activeItem.classList.remove('active');
                }
                item.classList.add('active');
                activeItem = item;
            }
        });

    });

    document.querySelectorAll('.item-trigger').forEach(function (trigger, i) {
        trigger.style.animationDelay = delay * i + 's';
    });

    document.addEventListener('click', (e) => {
        if ((activeItem && !activeItem.contains(e.target)) || (activeItem && e.target === activeItem)) {
            activeItem.classList.remove('active');
            activeItem = null;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && activeItem) {
            activeItem.classList.remove('active');
            activeItem = null;
        }
    });

    const removeActiveClass = () => {
        if (activeItem) {
            activeItem.classList.remove('active');
            activeItem.querySelector('.item-trigger').blur();
            activeItem = null;
        }
    };

    if (navigator.userAgent.toLowerCase().includes('firefox')) {
        document.querySelectorAll('textPath').forEach(textPath => {
            let offset = textPath.getAttribute("startOffset");
            if (offset.endsWith('%')) {
                let value = Math.max(0, parseFloat(offset) - 10) + '%';
                textPath.setAttribute("startOffset", value);
            }
        });
    }

    sectionsWrap.addEventListener('scroll', removeActiveClass);

});

