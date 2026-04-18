@echo off
REM 请根据你 V2Ray 客户端的 HTTP 监听端口进行修改
set PROXY_PORT=10808
set PROXY_ADDR=127.0.0.1:%PROXY_PORT%
REM 设置 HTTP 和 HTTPS 代理环境变量
set http_proxy=http://%PROXY_ADDR%
set https_proxy=http://%PROXY_ADDR%
echo =========================================================
echo ✅ 代理已设置完毕！
echo ✅ HTTP/S Proxy: http://%PROXY_ADDR%
echo ✅ 当前 CMD 窗口中的工具（如 curl/git/pip）将走代理。
echo =========================================================
echo.
REM 启动一个新的 CMD 窗口，并继承当前设置的环境变量
cmd /k