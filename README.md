一个todolist的后端，有登录功能，todolist的增删改查
DB->SQLite
表1：users
user_id
username
password
表2：todos
taskname
proity
status
user_id
ORM->Drizzle
框架->Express
测试->Vitest

mkdir -p todo/{conf,data} 
mkdir -p todo/data/logs
touch todo/data/sqlite.db
sudo chown -R 1001:1001 todo/data
cd todo/conf
docker compose up -d 

