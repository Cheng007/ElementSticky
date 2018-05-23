/**
 * 粘性元素
 * target: 目标元素
 * container: 容器元素
 * offset: 偏移量，向下为正向上为负
 * action:
 *  'topSticky': 粘住目标元素于容器的上方
 *  'bottomSticky': 粘住目标元素于容器的下方
 *  'hScrollSticky': 粘住目标元素的水平滚动条于容器下方
 */
// TODO: 采用 reuqestAnimationFram 提高性能 
class ElementSticky {
  constructor({ target, container, offset = 0, action } = {}) {
    if (!target)
      return console.error('elementSticky: no param target');
    if (!container)
      return console.error('elementSticky: no param container');
    if (!ElementSticky._isElement(target))
      return console.error('elementSticky: param target must be a HTMLElement');
    if (!ElementSticky._isElement(container))
      return console.error('elementSticky: param container must be a HTMLElement');
    if (!action)
      return console.error('elementSticky: no param action');
    if (action !== 'topSticky' && action !== 'bottomSticky' && action !== 'hScrollSticky')
      return console.error('elementSticky: not supported action type');
    if (typeof offset !== 'number')
      return console.error('elementSticky: param offset must be a Number');

    this.target = target;
    this.container = container;
    this.offset = offset;
    this.action = action;

    this.distory();
    this.init();
    this.listen();
  }

  createVirtualScroll() {
    this.container.style.overflowX = 'hidden';

    // 创建模拟滚动条
    this.virtualWrap = document.createElement('div');
    this.virtualContent = document.createElement('div');
    this.virtualWrap.appendChild(this.virtualContent);

    // 将模拟滚动条插入目标元素下一节点
    this.container.parentNode.insertBefore(this.virtualWrap, this.container.nextSibling);
  }

  listen() {
    window.elementSticky = {
      scrollVirtual: e => this.container.scrollLeft = e.target.scrollLeft,
      setVirtualPosition: e => this.setVirtualPosition(e),
      setStyle: () => this.setStyle(),
      setVirtualStyle: () => this.setStyle(),
    };

    if (this.action === 'topSticky' || this.action === 'bottomSticky') {
      window.addEventListener('scroll', window.elementSticky.setStyle);
      window.addEventListener('resize', window.elementSticky.setStyle);
    }

    if (this.action === 'hScrollSticky') {
      this.virtualWrap.addEventListener('scroll', window.elementSticky.scrollVirtual);
      window.addEventListener('scroll', window.elementSticky.setVirtualPosition);
      window.addEventListener('resize', window.elementSticky.setVirtualStyle);
    }
  }

  init() {
    if (this.action === 'topSticky' || this.action === 'bottomSticky') {
      this.setStyle();
    }
    if (this.action === 'hScrollSticky') {
      this.createVirtualScroll();
      this.setStyle();
    }
  }

  setStyle() {
    const
      { top: cTop,
        bottom: cBottom,
        width: cWidth,
        height: cHeight,
        left: cLeft,
      } = this.container.getBoundingClientRect(),
      { width: tWidth,
        height: tHeight,
      } = this.target.getBoundingClientRect(),
      os = this.offset,
      clientHeight = document.documentElement.clientHeight;

    if (this.action === 'topSticky') {
      const y = cTop > os ? 0 : cTop < tHeight - cHeight + os ? cHeight - tHeight : -cTop + os;
      this.target.style.transform = `translate3d(0, ${y}px, 0)`;
    }

    if (this.action === 'bottomSticky') {
      const y = cBottom < clientHeight + os
        ? 0
        : cTop >= clientHeight - tHeight + os
          ? tHeight - cHeight
          : clientHeight - cBottom + os;
      this.target.style.transform = `translate3d(0, ${y}px, 0)`;
    }

    if (this.action === 'hScrollSticky') {
      this.virtualWrap.style = `
          position: fixed;
          left: ${cLeft + 'px'};
          bottom: ${-this.offset};
          width: ${cWidth + 'px'};
          overflow-x: auto;
          `;
      this.virtualContent.style = `
          width: ${tWidth + 'px'};
          height: 1px;
          opacity: 0;
          pointer-events: none;
          `;
      this.setVirtualPosition();

      this.virtualWrap.scrollLeft = this.container.scrollLeft;
    }
  }

  setVirtualPosition() {
    const tBottom = this.target.getBoundingClientRect().bottom,
      cTop = this.container.getBoundingClientRect().top,
      os = this.offset,
      clientHeight = document.documentElement.clientHeight,
      bottom = cTop > clientHeight ? clientHeight - cTop : -this.offset;

    this.virtualWrap.style.position = clientHeight >= tBottom - os ? 'static' : 'fixed';
    this.virtualWrap.style.bottom = bottom + 'px';
  }

  distory() {
    if (!window.elementSticky) return;

    if (this.action === 'topSticky' || this.action === 'bottomSticky') {
      window.removeEventListener('scroll', window.elementSticky.setStyle);
      window.removeEventListener('resize', window.elementSticky.setStyle);
    }

    if (this.action === 'hScrollSticky') {
      const c = this.container;
      if (this.virtualWrap)
        this.virtualWrap.removeEventListener('scroll', window.elementSticky.scrollVirtual);

      window.removeEventListener('scroll', window.elementSticky.setVirtualPosition);
      window.removeEventListener('scroll', window.elementSticky.setVirtualStyle);

      if (c && c.parentNode) {
        c.parentNode.removeChild(c.nextSibling);
        if (!c) c.parentNode.replaceChild(c.children[0], c);
      }
    }

    delete window.elementSticky;
  }

  static _isElement(el) {
    return !!el
      && typeof el.nodeName === 'string'
      && el.nodeType === 1
      && Element.prototype.isPrototypeOf(el);
  }
}

export default ElementSticky;
