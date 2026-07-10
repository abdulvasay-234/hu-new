export const initTabs = (root = document) => {
  root.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const triggers = Array.from(tabs.querySelectorAll('[role="tab"]'));
    const panels = Array.from(tabs.querySelectorAll('[role="tabpanel"]'));

    const activate = (trigger) => {
      const targetId = trigger.getAttribute('aria-controls');

      triggers.forEach((item) => {
        const isActive = item === trigger;
        item.setAttribute('aria-selected', String(isActive));
        item.tabIndex = isActive ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel.id !== targetId;
      });
    };

    triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => activate(trigger));

      trigger.addEventListener('keydown', (event) => {
        let nextIndex = index;

        if (event.key === 'ArrowRight') {
          nextIndex = (index + 1) % triggers.length;
        } else if (event.key === 'ArrowLeft') {
          nextIndex = (index - 1 + triggers.length) % triggers.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = triggers.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        triggers[nextIndex]?.focus();
        activate(triggers[nextIndex]);
      });
    });

    const activeTrigger = triggers.find((trigger) => trigger.getAttribute('aria-selected') === 'true') ?? triggers[0];
    if (activeTrigger) {
      activate(activeTrigger);
    }
  });
};