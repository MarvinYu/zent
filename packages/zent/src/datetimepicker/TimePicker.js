import React, { Component, PureComponent } from 'react';
import classNames from 'classnames';
import Input from 'input';
import Popover from 'popover';
import formatDate from 'zan-utils/date/formatDate';
import parseDate from 'zan-utils/date/parseDate';
import getWidth from 'utils/getWidth';

import TimePanel from './time-select/TimePanel';
import PanelFooter from './common/PanelFooter';
import {
  noop,
  popPositionMap,
  commonProps,
  commonPropTypes
} from './constants/';

function extractStateFromProps(props) {
  let showPlaceholder;
  let selected;
  let actived;
  const { format, value, defaultValue } = props;

  if (value) {
    const tmp = parseDate(`${value}`, format);
    if (tmp) {
      showPlaceholder = false;
      selected = actived = tmp;
    } else {
      console.warn("date and format don't match."); // eslint-disable-line
      showPlaceholder = true;
      actived = new Date();
    }
  } else {
    showPlaceholder = true;
    if (defaultValue) {
      actived = parseDate(`${defaultValue}`, format);
    } else {
      actived = new Date();
    }
  }

  return {
    value: selected && formatDate(selected, format),
    actived,
    selected,
    openPanel: false,
    showPlaceholder
  };
}

class TimePicker extends (PureComponent || Component) {
  static PropTypes = {
    ...commonPropTypes
  };

  static defaultProps = {
    ...commonProps,
    placeholder: '请选择时间',
    format: 'HH:mm:ss',
    needConfirm: true
  };

  constructor(props) {
    super(props);
    this.state = extractStateFromProps(props);
  }

  componentWillReceiveProps(next) {
    const state = extractStateFromProps(next);
    this.setState(state);
  }

  onChangeTime = val => {
    this.setState({
      actived: val
    });
  };

  onSelectCurrent = () => {
    this.setState({
      actived: new Date()
    });
  };

  onClearInput = evt => {
    evt.stopPropagation();
    this.props.onChange('');
  };

  onConfirm = () => {
    const { props, state } = this;

    let value = '';
    if (state.selected) {
      value = formatDate(state.selected, props.format);
    }

    this.setState({
      value,
      openPanel: false,
      showPlaceholder: false
    });
    this.props.onChange(value);
  };

  renderPicker() {
    const { state, props } = this;

    let timePicker;
    if (state.openPanel) {
      timePicker = (
        <div className="time-picker" ref={ref => (this.picker = ref)}>
          <TimePanel
            actived={state.actived}
            selected={state.selected}
            onChange={this.onChangeYear}
            onSelect={this.onSelectYear}
            disabledDate={this.isDisabled}
          />
          {props.needConfirm && (
            <PanelFooter
              buttonText={props.confirmText}
              linkText="此刻"
              linkCls="link--current"
              onClickButton={this.onConfirm}
            />
          )}
        </div>
      );
    }

    return timePicker;
  }

  togglePicker = () => {
    const { onOpen, onClose, disabled } = this.props;
    const openPanel = !this.state.openPanel;

    if (disabled) return;

    openPanel ? onOpen && onOpen() : onClose && onClose();
    this.setState({
      openPanel: !this.state.openPanel
    });
  };

  render() {
    const { props, state } = this;
    const wrapperCls = `${props.prefix}-datetime-picker ${props.className}`;
    const inputCls = classNames({
      'picker-input': true,
      'picker-input--filled': !state.showPlaceholder,
      'picker-input--disabled': props.disabled
    });
    const widthStyle = getWidth(props.width);

    return (
      <div style={widthStyle} className={wrapperCls}>
        <Popover
          cushion={5}
          visible={state.openPanel}
          onVisibleChange={this.togglePicker}
          className={`${props.prefix}-datetime-picker-popover ${props.className}-popover`}
          position={popPositionMap[props.popPosition.toLowerCase()]}
        >
          <Popover.Trigger.Click>
            <div style={widthStyle} className={inputCls}>
              <Input
                name={props.name}
                value={state.showPlaceholder ? props.placeholder : state.value}
                onChange={noop}
                disabled={props.disabled}
              />
              <span className="zenticon zenticon-calendar-o" />
              <span
                onClick={this.onClearInput}
                className="zenticon zenticon-close-circle"
              />
            </div>
          </Popover.Trigger.Click>
          <Popover.Content>{this.renderPicker()}</Popover.Content>
        </Popover>
      </div>
    );
  }
}

export default TimePicker;
