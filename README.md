# 运行项目
`npm start`

## 网络电话呼叫接口

POST voipcall/create
params: { account_id, leads_id, user_id, callee_number, ?request_id }
res: { contact_id, request_id }

## 获取网络电话Token接口

POST voipcall_token/get
params: { account_id, user_id, ?request_id }
res: { token, request_id }

## websocket接口

### 前端发送:

create_room {}
room_created { roomId }
answer { roomId }
refuse { roomId }
hangup { roomId }
logout {}

### 后端发送

room_created { roomId, contactId, voIPUserId }
enter_room { roomId, userSig }
user_answered { roomId }
user_hangup { roomId }
call_failed { roomId, reason }
logout { reason, calling_repetition }
call_incoming { roomId, leadsId, name, phone, location, contactId }
error { roomId, type }

# 测试环境验证

## 自建验证crm的前后端

简化起见，不做登录、数据验证等。直接按照请求参数来。 前端的页面可以默认展示一些数据库中有的数据，必有accountId、leadsId、userId、phone。

因为后续不同人进行测试使用的userId不同，故希望前端可以做成让人自行输入一些数据生成列表的形式。

可自行输入userId： 验证同一个userid打开多个页面，同时建多个连接的情况； 多个用户同时操作的情况

自行输入accountId、leadsId、phone：验证accountId的授权情况，和leadsId的关系，phone适合和leadsId对应等
