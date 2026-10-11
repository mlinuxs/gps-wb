本项目是ESP32 MicroPython，禁止使用esp‑idf、eim、idf.py、编译相关操作。
环境信息：
macOS系统，python完整路径：/Users/kylin/miniforge3/bin/python
ESP32固定串口：/dev/cu.usbserial-53100033101

所有硬件操作请直接调用VSCode终端执行完整命令：
#上传脚本
python -m mpremote connect /dev/cu.usbserial-53100033101 fs cp main.py :
#运行脚本获取输出
python】 -m mpremote connect /dev/cu.usbserial-53100033101 run main.py
#复位板子
python -m mpremote connect /dev/cu.usbserial-53100033101 reset
#拉取板子上main.py到本地
python -m mpremote connect /dev/cu.usbserial-53100033101 fs cp :main.py ./main.py

规则：
1.捕获终端输出的全部日志、Python异常报错堆栈；
2.根据报错修改本地py源码；
3.修改完成后重新上传脚本，复位板子复现bug；
4.串口不能被其他程序占用；
5.所有硬件信息全部来自终端输出，禁止编造。