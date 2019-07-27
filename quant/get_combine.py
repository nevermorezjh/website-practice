import re
import sys
import subprocess

result = subprocess.check_output(['C:/JoinQuant-Desktop-Py3/Python/python.exe', 'C:/JoinQuant-Desktop-Py3/Python/TEST1.py'])
result = result.decode()
result = result.split('\n')
i, line_num = 0, len(result)
keys = []
while i < line_num:
	if "Selling" in result[i]:
		stock = re.findall(r'Selling (.+)\r', result[i])
		number = re.findall(r'- INFO  - (.+)\r', result[i+1])
		i += 2
		keys.append(['Selling', stock, number])
	elif "Buying" in result[i]:
		stock = re.findall(r'Buying (.+)\r', result[i])
		number = re.findall(r'- INFO  - (.+)\r', result[i+1])
		i += 2
		keys.append(['Buying', stock, number])
	else:
		i += 1

print(keys)