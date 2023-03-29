import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import {
  message,
  Table,
  Button,
  Form,
  Input,
  Popconfirm,
  Space,
  Col,
  Row,
  Divider,
} from 'antd';
import TencentNetCall from 'net-call-sdk';
import type { InputRef } from 'antd';
import type { FormInstance } from 'antd/es/form';
import axios from 'axios';
import 'antd/dist/reset.css';
import { listData } from '../listData';

let netCall: TencentNetCall | null = null;

const log = (str: string) => console.log(`%c[CRM] ${str}`, 'color: violet');

const EditableContext = React.createContext<FormInstance<any> | null>(null);

type Info = {
  token: string;
  account_id: number;
  user_id: number;
  fetching: boolean;
}

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof DataType;
  record: DataType;
  handleSave: (record: DataType) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...resetProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (error) {
      if (error instanceof Error) {
        log(`Save failed: ${error.message}`);
      }
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required`,
          },
        ]}
      >
        <Input
          ref={inputRef}
          onPressEnter={save}
          onBlur={save}
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24}}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...resetProps}>{childNode}</td>
};

type EditableTableProps = Parameters<typeof Table>[0];

interface API_Token {
  code: number;
  message: string;
  data: {
    token: string;
    request_id: string;
  };
}

interface API_Call {
  code: number;
  message: string;
  data: {
    contact_id: string;
    request_id: string;
  };
}

interface DataType {
  key: React.Key;
  /** 线索id */
  leadsId: number;
  /** 广告主账号id */
  accountId: number;
  /** 客服id */
  user_id: number;
  /** 线索号码 */
  callee_number: number;
  /** 线索用户姓名 */
  callee_name: string;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

declare global {
  var login: any;
  var callUser: any;
  var setCommingCall: any;
}

interface TokenGetParams {
  account_id: number;
  user_id: number;
}

function DefaultUI() {
  const [info, setInfo] = useState<Info>({
    token: 'null',
    account_id: 20458,
    user_id: 20458,
    fetching: false,
  });
  const tokenParams = useRef<TokenGetParams>({
    account_id: info.account_id,
    user_id: info.user_id,
  });

  const [count, setCount] = useState(1);
  const [dataSource, setDataSource] = useState<DataType[]>(listData);

  const handleDelete = (key: React.Key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const handleCallRow = async (row: DataType) => {
    const params = {
      account_id: +row.accountId,
      leads_id: +row.leadsId,
      user_id: +(info.user_id || 0),
      callee_number: String(row.callee_number),
    };
    const checkResult = netCall!.checkReadyCall({
      calleeName: row.callee_name,
      calleePhoneNum: params.callee_number,
    });
    if (checkResult) {
      const { data } = await axios.post<API_Call>('voipcall/create', params);
      if (data.code !== 0) {
        message.error(data.message);
      }
    } else {
      message.error('websocket未连接或处于通话状态中');
    }
  };

  const handleCopy = (row: DataType) => {
    const index = dataSource.findIndex((item) => row.key === item.key);
    const item = dataSource[index];
    const copyItem: DataType = {
      ...item,
      key: `${String(item.key).split('-')[0]}-${new Date().valueOf()}`,
    };
    const newData = [...dataSource];
    newData.splice(index, 0, copyItem);
    setDataSource(newData);
    setCount(count + 1);
  };

  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: '线索id',
      dataIndex: 'leadsId',
      width: 180,
      editable: true,
    },
    {
      title: '广告主id',
      dataIndex: 'accountId',
      width: 150,
      editable: true,
    },
    {
      title: '客服id',
      dataIndex: 'user_id',
      width: 150,
      editable: true,
    },
    {
      title: '线索姓名',
      dataIndex: 'callee_name',
      width: 150,
      editable: true,
    },
    {
      title: '线索号码',
      dataIndex: 'callee_number',
      width: 160,
      editable: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record: any, index) => {
        const handleRowClick = () => handleCallRow(record);
        const handleRowCopy = () => handleCopy(record);
        return (
          <Space size="middle">
            <Button type="primary" onClick={handleRowClick}>call</Button>
            <Button type="link" onClick={handleRowCopy}>copy</Button>
            {
              index > 0 && (
                <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
                  <Button type="link">Delete</Button>
                </Popconfirm>
              )
            }
          </Space>
        );
      },
    },
  ];

  const handleSave = (row: DataType) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const handleUserIdChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value;
    const user_id = parseInt(value);
    tokenParams.current.user_id = user_id;
    setInfo((oldInfo) => ({ ...oldInfo, user_id }));
  };

  const handleAccountIdChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value;
    const account_id = parseInt(value);
    tokenParams.current.account_id = account_id;
    setInfo((oldInfo) => ({ ...oldInfo, account_id }));
  };

  const handleGetToken = useCallback(async (params: TokenGetParams) => {
    setInfo((inf) => ({ ...inf, fetching: true }));
    try {
      const { data } = await axios.post<API_Token>('voipcall_token/get', params);
      if (data.code === 0) {
        const { token } = data.data;
        setInfo((inf) => ({ ...inf, fetching: false, token }));
        netCall!.login(token);
      } else {
        message.error(data.message);
        throw new Error(data.message);
      }
    } catch (e) {
      setInfo((inf) => ({ ...inf, fetching: false }));
    }
  }, []);

  const handleCustomTokenLogin = async () => {
    netCall!.login(info.token);
  };

  const handleTokenChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value: token } = event.target;
    setInfo((oldInfo) => ({ ...oldInfo, token }));
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        title: col.title,
        editable: col.editable,
        dataIndex: col.dataIndex,
        handleSave,
      }),
    };
  });

  const getToken = () => {
    const params: TokenGetParams = {
      account_id: +(info.account_id || 0),
      user_id: +(info.user_id || 0),
    };
    handleGetToken(params);
  };

  useEffect(() => {
    if (netCall) return;
    netCall = new TencentNetCall({
      view: true,
      debug: false,
      cbAfterCall: () => log('call successfully finished'),
      onLoginStateChange: (state) => {
        log(`login state change to ${JSON.stringify(state)}`);
      },
      onCallinStateChange: (state) => {
        log(`callin state change to ${JSON.stringify(state)}`);
      },
      onCalloutStateChange: (state) => {
        log(`callout state change to ${JSON.stringify(state)}`);
      },
      onError: (data) => {
        message.error(data.msg || data.type);
        if (data.type === 'login_expired') {
          handleGetToken(tokenParams.current);
        }
      },
    });
  }, [handleGetToken]);

  useEffect(() => {
    netCall!.init();
  }, []);

  return (
    <div className="App">
      <div className="demo-table">
        <Row gutter={16}>
          <Col span={17}>
            <Space direction="vertical" size={16}>
              <Input.Group compact size="large">
                <Input
                  addonBefore="token"
                  value={info.token}
                  onChange={handleTokenChange}
                  style={{ width: `calc(100% - 185px)` }}
                />
                <Button type="primary" size="large" onClick={handleCustomTokenLogin}>
                  使用自定义token登录
                </Button>
              </Input.Group>
              <Input.Group size="large" className="info">
                <Row gutter={8}>
                  <Col span={10}>
                    <Input
                      addonBefore="user_id"
                      onChange={handleUserIdChange}
                      value={info.user_id || ''}
                    />
                  </Col>
                  <Col span={10}>
                    <Input
                      addonBefore="account_id"
                      onChange={handleAccountIdChange}
                      value={info.account_id || ''}
                    />
                  </Col>
                  <Col span={3}>
                    <Button
                      type="primary"
                      size="large"
                      loading={info.fetching}
                      onClick={getToken}
                    >
                      登录
                    </Button>
                  </Col>
                </Row>
              </Input.Group>
              <Divider>CRM端操作</Divider>
              <Table
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                pagination={false}
                dataSource={dataSource}
                columns={columns as ColumnTypes}
              />
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default DefaultUI;
