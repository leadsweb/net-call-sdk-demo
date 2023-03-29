import React from 'react';
import type { FC } from 'react';
import { StopOutlined, PhoneOutlined } from '@ant-design/icons';
import { Row, Col, Button, Space, Divider, Alert } from 'antd';
import type { ButtonProps } from 'antd';
import { CalloutState } from 'net-call-sdk';
import './caller.css';

type IconButtonProps = {
  disabled?: boolean;
  type: 'hang' | 'answer';
  onClick: ButtonProps['onClick'];
};

const IconButton: FC<IconButtonProps> = (props) => {
  let icon = <PhoneOutlined />;
  if (props.type === 'hang') icon = <StopOutlined />;

  return (
    <Button
      danger={props.type === 'hang'}
      type="primary"
      shape="circle"
      icon={icon}
      disabled={props.disabled}
      onClick={props.onClick}
    />
  )
};

type UserRegion = string;

export type CallUser = {
  name: string;
  phone: string;
  // room: number;
  region?: UserRegion;
};

export type CallerState = {
  logined: boolean;
  calloutState: CalloutState;
  calloutUser: CallUser | null;
  callinUser: CallUser | null;
};

type LoginState = {
  logined: boolean;
  check: () => void;
  logout: () => void;
};

const Login: FC<LoginState> = (props) => {
  let loginLabel = <span className="unlogin">未登录</span>;
  if (props.logined) loginLabel = <span className="logined">已登录</span>;

  return (
    <Space direction="vertical" className="login-box">
      <span>当前登录状态：{loginLabel}</span>
      {
        props.logined && (
          <Space>
            <Button type="primary" onClick={props.check}>通话质检</Button>
            <Button danger type="primary" onClick={props.logout}>退出</Button>
          </Space>
        )
      }
    </Space>
  );
};

type CallOutProps = {
  callState: CalloutState;
  user: CallUser | null;
  hang: (user: CallUser, type: 'call') => any;
};

const CallOut: FC<CallOutProps> = (props) => {
  const callStateMap: Record<number, string> = {
    0: '空闲',
    1: '拨号中',
    2: '通话中',
    3: '已挂断',
    4: '用户已挂断',
    5: '用户未接听',
    6: '呼叫失败',
    8: '发起呼叫',
  };

  if (props.callState === CalloutState.NOT_START) return null;

  if (!props.user) return <Alert showIcon type="error" message="没有找到用户信息" />;

  const handleHang = () => {
    props.hang(props.user!, 'call');
  };

  const btnDisabled = ![CalloutState.CALLING, CalloutState.CONNECTING].includes(props.callState);

  return (
    <div className="call-box">
      <Row gutter={24}>
        <Space direction="horizontal" size="middle" align="center">
          <Col span={6}>
            <IconButton type="hang" onClick={handleHang} disabled={btnDisabled} />
          </Col>
        </Space>
        <Col span={18}>
          <div className="call-out__state">
            <span>当前呼叫状态：</span>
            <b>{callStateMap[props.callState]}</b>
          </div>
          <div className="call-out__phone">{props.user.phone}</div>
          <div className="call-out__name">{props.user.name}</div>
        </Col>
      </Row>
    </div>
  );
};

type AnswerUserProps = {
  user: CallUser;
  hang: React.MouseEventHandler;
  answer: React.MouseEventHandler;
};

const AnswerUser: FC<AnswerUserProps> = (props) => {
  return (
    <div className="answer-user">
      <Row gutter={24}>
        <Col span={4}>
          <IconButton type="answer" onClick={props.answer} />
        </Col>
        <Col span={4}>
          <IconButton type="hang" onClick={props.hang} />
        </Col>
        <Col span={16}>
          <div>{props.user.phone}</div>
          <div>{props.user.name}</div>
        </Col>
      </Row>
    </div>
  );
};

type CallInProps = {
  user: CallUser | null;
  answer: (user: CallUser) => any;
  refuse: (user: CallUser) => any;
};

const CallIn: FC<CallInProps> = (props) => {
  const { user } = props;
  if (user === null) return null;
  return (
    <div className="answer-box">
      <Divider>回呼用户</Divider>
      <AnswerUser
        key={user.phone}
        user={user}
        answer={() => props.answer(user)}
        hang={() => props.refuse(user)}
      />
    </div>
  );
};

export type CallerProps = {
  show: boolean;
  data: CallerState;
  hang: (user: CallUser) => void;
  answer: (user: CallUser) => void;
  refuse: (user: CallUser) => void;
  check: () => void;
  logout: () => void;
};

const Caller: FC<CallerProps> = (props) => {
  const state = props.data;

  if (!props.show) return null;

  return (
    <div className="caller">
      <Login logined={state.logined} check={props.check} logout={props.logout} />
      <CallOut callState={state.calloutState} user={state.calloutUser} hang={props.hang} />
      <CallIn user={state.callinUser} answer={props.answer} refuse={props.refuse} />
    </div>
  );
};

export default Caller;
