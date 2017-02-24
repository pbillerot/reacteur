'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var React = require('react');

var PagerItem = (function (_React$Component) {
  function PagerItem() {
    _classCallCheck(this, PagerItem);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(PagerItem, _React$Component);

  _createClass(PagerItem, [{
    key: 'handleClick',
    value: function handleClick(ev) {
      ev.preventDefault();
      if (!this.props.active && !this.props.disabled) {
        this.props.skipTo(this.props.page);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var status = this.props.active ? 'rc-pager-item-active' : '';
      if (this.props.disabled) {
        status += ' rc-pager-item-disabled';
      }
      return React.createElement(
        'li',
        { onClick: this.handleClick.bind(this), className: status },
        React.createElement(
          'a',
          { href: '#' },
          this.props.text
        )
      );
    }
  }]);

  return PagerItem;
})(React.Component);

/**
 * @private
 * 命令子项
 */

var CmdItem = (function (_React$Component2) {
  function CmdItem() {
    _classCallCheck(this, CmdItem);

    if (_React$Component2 != null) {
      _React$Component2.apply(this, arguments);
    }
  }

  _inherits(CmdItem, _React$Component2);

  _createClass(CmdItem, [{
    key: 'handleClick',
    value: function handleClick(ev) {
      ev.preventDefault();
      if (!this.props.disabled) {
        this.props.skipTo(this.props.page);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var disabled = this.props.disabled ? 'rc-pager-item-disabled' : '';
      return React.createElement(
        'li',
        { onClick: this.handleClick.bind(this), className: disabled },
        React.createElement(
          'a',
          { href: '#' },
          React.createElement(
            'span',
            { 'aria-hidden': 'true' },
            this.props.text
          )
        )
      );
    }
  }]);

  return CmdItem;
})(React.Component);

//分页栏

var Pager = (function (_React$Component3) {
  function Pager(props) {
    _classCallCheck(this, Pager);

    _get(Object.getPrototypeOf(Pager.prototype), 'constructor', this).call(this, props);
    this.skipTo = this.skipTo.bind(this);
  }

  _inherits(Pager, _React$Component3);

  _createClass(Pager, [{
    key: '_getFirstItem',

    //获取首页按钮
    value: function _getFirstItem() {
      var self = this,
          props = self.props,
          current = props.current,
          disabled = current === 0,
          label = props.previousLabel || '«';

      //return React.createElement(CmdItem, { disabled: disabled, text: label, skipTo: this.skipTo, page: current - 1 });
      return null
    }
  }, {
    key: '_getLastItem',

    //获取最后一页按钮
    value: function _getLastItem() {
      var self = this,
          total = self.props.total,
          current = self.props.current,
          disabled = current === total - 1,
          label = self.props.nextLabel || '»';

      //return React.createElement(CmdItem, { disabled: disabled, text: label, skipTo: this.skipTo, page: current + 1 });
      return null
    }
  }, {
    key: '_getItems',

    //获取所有数字按钮
    value: function _getItems() {
      var self = this,
          total = self.props.total,
          current = self.props.current,
          rst = [],
          from = 0,
          active,
          skip = 1,
          to = total - 1;

      if (current > skip) {
        from = current - skip;
      }
      if (total - current > skip) {
        to = current + skip;
      }
      if (from !== 0) {
        rst.push(React.createElement(PagerItem, { key: '0', text: 1, skipTo: this.skipTo, page: 0 }));
        if (from > 1) {
          rst.push(React.createElement(PagerItem, { key: 'from', text: '...', disabled: true }));
        }
      }

      for (var i = from; i <= to; i++) {
        active = current === i;
        rst.push(React.createElement(PagerItem, { key: i.toString(), text: i + 1, active: active, skipTo: this.skipTo, page: i }));
      }

      if (to < total - 1) {
        active = current === total - 1;
        if (to < total - 2) {
          rst.push(React.createElement(PagerItem, { key: 'to', text: '...', disabled: true }));
        }
        rst.push(React.createElement(PagerItem, { key: 'max', text: total, skipTo: this.skipTo, page: total - 1 }));
      }
      return rst;
    }
  }, {
    key: 'skipTo',

    /**
     * 跳转到对应的节点
     * @param  {Number} page 页码
     */
    value: function skipTo(page) {
      var handler = this.props.onSkipTo;
      if (handler) {
        handler(page);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var self = this,
          first = self._getFirstItem(),
          last = self._getLastItem(),
          items = self._getItems();

      var className = 'rc-pager';
      if (this.props.className) {
        className += ' ' + this.props.className;
      }

      return React.createElement(
        'ul',
        { className: className },
        first,
        items,
        last
      );
    }
  }]);

  return Pager;
})(React.Component);

module.exports = Pager;