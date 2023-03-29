import React, { useEffect } from 'react';
import { Menu } from 'antd';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';

const items: MenuProps['items'] = [
  {
    key: '/home',
    label: 'SDK自带样式',
  },
  {
    key: '/customui',
    label: '使用自定义样式',
  },
];

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') navigate('/home');
  }, [location.pathname, navigate]);

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <div className="layout">
      <Menu
        mode="inline"
        onClick={handleClick}
        style={{ width: 256, height: '100%' }}
        defaultSelectedKeys={[location.pathname]}
        items={items}
      />
      <Outlet />
      {/* 网络电话SDK需要下面2个div，删除会报错 */}
      <div className="login"></div>
      <div id='remote_stream' style={{ height: '0px' }} />
    </div>
  );
};

export default Layout;
